/**
 * 利用window.onerror来上报错误信息
 * @params opts - object,
 * example: { recordStack: true }
 * @author MrGalaxyn
 */

export default class ErrorCatcher {
    constructor(sendCb, opts = {}, name) {
        this.name = name || 'error';
        let oldOnError = window.onerror;

        // error 信息需要实时上报
        window.onerror = function(message, file, line, column, error) {
            oldOnError && oldOnError.apply(this, arguments);
            let errorMsg = { err: 1 };
            if ($CONFIG['uid']) {
                errorMsg.uid = $CONFIG['uid'];
            }
            sendCb(errorMsg);
        };

        this.inited = true;

        if (!window['__report__']) {
            window['__report__'] = (error, source, start, end) => {
                let errorMsg = {
                    t: 're', // short for window error
                    m: error.message,
                    p: source + '[' + start + ',' + end + ']'
                };
                if ($CONFIG['uid']) {
                    errorMsg.uid = $CONFIG['uid'];
                }
                sendCb(errorMsg);
            }
        }
    }

    config(sendCb, opts) {
        if (!this.inited) {
            throw Error('plugin SpaCatcher has not init yet!');
        }
    }
}
