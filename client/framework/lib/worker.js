/* eslint-env commonjs */
/* global process */
import { 
    MESSAGE_CONNECT, MESSAGE_CREATE_ACTION, MESSAGE_POST, MESSAGE_DISCONNECT,
    MESSAGE_JUMP, MESSAGE_READY, MESSAGE_RESET
} from './connectorType';

if (!global._babelPolyfill) {
    // 如果没有证明是worker进程, 则需要再次加载babel-polyfill
    require('babel-polyfill');
    var worker = self;
} else {
    var worker = window['__CONNECTOR__'].worker;
}

import { isSame } from 'utils/differ';
import { createReduxStore } from './createReduxStore';
import requireModules from './requireModules';

const initialState = {};
var subscribeList = {};
var currentStore = {};

function handleChange() {
    let prevStoreState = currentStore;
    currentStore = store.getState();
    let subscribeKeys = Object.keys(subscribeList);

    if (currentStore === prevStoreState || subscribeKeys.length === 0) {
        return;
    }

    subscribeKeys.forEach((serializedStoreShapes) => {
        let storeShapes = JSON.parse(serializedStoreShapes);
        let uuids = subscribeList[serializedStoreShapes];
        let isChanged = false;
        var mapState = {};
        storeShapes.map(shapeRegular => {
            let subscribedStorePath = shapeRegular.split('.');
            let propsName = subscribedStorePath.pop();
            let subState = currentStore[subscribedStorePath.join('.')][propsName];
            mapState[propsName] = subState;

            // 如果已经发现有变化, 就不用再检查了
            if (isChanged) return;

            let prevCompState = prevStoreState[subscribedStorePath.join('.')];
            if (!prevCompState) {
                isChanged = true;
            } else {
                let prevSubState = prevCompState[propsName];

                if (!isSame(subState, prevSubState)) {
                    isChanged = true;
                }
            }
        });

        if (isChanged) {
            uuids.forEach(uuid => send(uuid, mapState));
        }
    });
}

function getCurrentStoreState(storeShapes, uuid) {
    var mapState = {};

    storeShapes.map(shapeRegular => {
        let subscribedStorePath = shapeRegular.split('.');
        let propsName = subscribedStorePath.pop();
        let subState = currentStore[subscribedStorePath.join('.')][propsName];
        mapState[propsName] = subState;
    });
    send(uuid, mapState);
}

function disconnect(uuid) {
    let keys = Object.keys(subscribeList);
    let len = keys.length;
    let serializedStoreShapes, uuids;
    for (var i = 0; i < len; i++) {
        serializedStoreShapes = keys[i];
        let storeShapes = JSON.parse(serializedStoreShapes);
        uuids = subscribeList[serializedStoreShapes];
        if (uuids.indexOf(uuid) >= 0) break;
    }

    if (i === len) {
        return false;
    }

    if (uuids.length === 1) {
        delete subscribeList[serializedStoreShapes];
    }

    uuids.splice(uuids.indexOf(uuid), 1);

    return true;
}

function connect(uuid, payload) {
    let serializedPayload = JSON.stringify(payload);
    if (!subscribeList[serializedPayload]) {
        subscribeList[serializedPayload] = [];
    }
    subscribeList[serializedPayload].push(uuid);

    requireModules(currentStore, payload, function() {
        currentStore = store.getState();
        getCurrentStoreState(payload, uuid);
    })
}

function dispatch(action, payload, uuid) {
    let methodPos = action.lastIndexOf('.');
    let requireFile = action.substring(0, methodPos);
    let requireFunc = action.substring(methodPos + 1);

    requireModules(currentStore, [action], function(modules) {
        currentStore = store.getState();
        let actionCreator = modules[requireFile][requireFunc];
        if (actionCreator) {
            Promise.all([store.dispatch(actionCreator.apply(null, payload))]).then(() =>
                typeof uuid !== "undefined" && send(uuid, true)
            ).catch(() => typeof uuid !== "undefined" && send(uuid, false));  
        } else {
            if (process.env.NODE_ENV !== 'production') {
                console.error("create unexists action: " + action)
            }
        }
    })
}

function reset(storePath) {
    requireModules(currentStore, [storePath + '.occupying'], function(modules) {
        currentStore = store.getState();
        let initialState = modules[storePath].initialState;
        let actionCreator = modules.repoch.reset;

        if (initialState) {
            store.dispatch(function reset(state) {
                return { type: 'REPOCH@@RESET/' + storePath, state: state };
            }.call(null, initialState));
        }
    })
}

function send(uuid, payload) {
    let rawPayload = JSON.stringify({
        uuid, payload,
        type: MESSAGE_POST
    });
    worker.postMessage(rawPayload);
}

function workerRedirect(url) {
    let rawPayload = JSON.stringify({
        url, type: MESSAGE_JUMP
    });
    worker.postMessage(rawPayload);
}

function processRawMessage(message) {
    let uuid = message.uuid;
    let payload = message.payload;
    let action = message.action;

    switch (message.type) {
         case MESSAGE_CONNECT:
            // 向worker订阅store中的数据
            connect(uuid, payload)
            break;

        case MESSAGE_CREATE_ACTION:
            // 调用action creator
            dispatch(action, payload, uuid);
            break;

        case MESSAGE_RESET:
            // 重置页面store中的数据
            reset(payload);
            break;

        case MESSAGE_DISCONNECT:
            // 取消store变化事件监听
            disconnect(uuid);
            break;
    }
}

var store = createReduxStore(initialState);
currentStore = store.getState();
store.subscribe(handleChange);

worker.addEventListener('message', (e) => {
    let data = JSON.parse(e.data);
    processRawMessage(data);
}, false);
worker.postMessage(JSON.stringify({ type: MESSAGE_READY }));

