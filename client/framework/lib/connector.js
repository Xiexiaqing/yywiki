import { 
    MESSAGE_CONNECT, MESSAGE_CREATE_ACTION, MESSAGE_POST, MESSAGE_DISCONNECT,
    MESSAGE_JUMP, MESSAGE_READY, MESSAGE_RESET
} from './connectorType';
import redirect from 'utils/io/redirect';

class BaseAdapter {
    constructor() {
        this.worker = null;
        this._uuid = 0;
        this._eventBus = [];
        this._onReadyCallback = []
    }

    post = (payload) => {
        let rawPayload = JSON.stringify(payload);
        this.worker.postMessage(rawPayload);
    }

    connect = (payload, callback) => {
        let uuid = this._uuid++;
        this._eventBus.push({ callback, uuid });

        this.post({
            uuid, payload,
            type: MESSAGE_CONNECT
        });

        return uuid;
    }

    createAction = (action, callback, ...payload) => {
        let uuid;
        if (typeof callback === 'function') {
            uuid = this._uuid++;
            this._eventBus.push({ callback, uuid });
        } else if (callback !== undefined || payload.length > 0) {
            payload.unshift(callback);
        }

        this.post({
            action, payload, uuid,
            type: MESSAGE_CREATE_ACTION
        });
    }

    reset = (storePath) => {
        this.post({ payload: storePath, type: MESSAGE_RESET });
    }

    off = (uuid) => {
        let index = this._eventBus.findIndex(evt => {
            return evt ? evt.uuid === uuid : false;
        });
        this._eventBus[index] = null;

        this.post({
            uuid,
            type: MESSAGE_DISCONNECT
        })
    }

    _processRawMessage = (message) => {
        let uuid = message.uuid;

        switch (message.type) {
            case MESSAGE_POST:
                let createActionCallbackIndex = -1;
                // worker接收全局的数据
                let hasNoSubstibedCallback = this._eventBus.every((evt, index) => {
                    if (!evt || evt.uuid !== uuid) return true;
                    evt.callback(message.payload);

                    createActionCallbackIndex = (typeof message.payload === "boolean") ?
                        index : -1;

                    return false;
                });

                // 如果是回调方式，则执行后删除回调
                if (createActionCallbackIndex > -1) {
                    this._eventBus[createActionCallbackIndex] = null;
                }

                if (hasNoSubstibedCallback) {
                    console.warn("state change, but there is no callback to deal with it!")
                }

                break;
            // only main thread can communicate with dom
            case MESSAGE_JUMP:
                redirect(message.url);
                break;

            // only main thread can communicate with dom
            case MESSAGE_READY:
                this._onReadyCallback.forEach((callback) => {
                    callback(this);
                });
                break;
        }
    }
}

class FakeWorker {
    constructor(type) {
        window._messageChannel = window._messageChannel || {
            listener: [null, null],
            register: function(flag, callback) {
                let type = flag ? 0 : 1;
                window._messageChannel.listener[type] = callback;
            }
        };

        this.type = type;
    }

    addEventListener(evt, callback) {
        window._messageChannel.register(this.type, callback);
    }

    postMessage(message) {
        let type = this.type ? 1 : 0;
        let listener = window._messageChannel.listener[type];
        listener({ data: message });
    }
}

class LocalAdapter extends BaseAdapter {
    constructor(onReadyCb) {
        super();

        this.isPresentation = false;
        this._onReadyCallback = [];

        var self = this;
        if (onReadyCb) {
            this.isPresentation = true;
            this._onReadyCallback.push(onReadyCb);
            require.ensure([], function(require) {
                require('./worker');
            }, "worker");
        }

        this.worker = new FakeWorker(this.isPresentation);
        this.worker.addEventListener('message', (e) => {
            let data = JSON.parse(e.data);
            self._processRawMessage(data);
        }, false);
    }

    onReady = (callback) => {
        if (this._onReadyCallback === false) {
            callback(this)
        } else {
            this._onReadyCallback.push(callback);
        }
    }
}

if (process.env.WORKER === true) {
    // class WorkerAdapter extends BaseAdapter {
    //     constructor(onReadyCb) {
    //         super();
    //         var Worker = require("worker?inline!./worker.js");
    //         this.worker = new Worker;
    //         onReadyCb && this._onReadyCallback.push(onReadyCb);

    //         var _self = this;
    //         this.worker.addEventListener('message', (e) => {
    //             let data = JSON.parse(e.data);
    //             _self._processRawMessage(data);
    //         }, false);
    //     }

    //     onReady = (callback) => {
    //         if (this._onReadyCallback === false) {
    //             callback(this)
    //         } else {
    //             this._onReadyCallback.push(callback);
    //         }
    //     }
    // }
}

export default function initConnector(onReadyCb) {
    if (process.env.WORKER === true) {
        return new WorkerAdapter(onReadyCb);
    }

    window['__CONNECTOR__'] = window['__CONNECTOR__'] || new LocalAdapter();
    return new LocalAdapter(onReadyCb);
}

