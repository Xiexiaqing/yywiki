/**
 * bee - page data collection
 * @author MrGalaxyn
 */
import plugins from './plugins/index';
import browserHistory from 'react-router/lib/browserHistory';
import setting from 'config/setting';

const MAX_STORE_SIZE = 2000;
const BEE_SEPERATOR = '|';

function sendByFakeImage(sendURL) {
    if (process.env.DEBUG === 'true') {
        return;
    }

    var img = new Image(1,1);
    img.onload = img.onerror = img.onabort = function() {
        img.onload = img.onerror = img.onabort = null;
        img = null;
    };
    img.src = sendURL;
}

function type(obj) {
    if (obj == null) return "null";
    return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase() || "object";
}

function doEscape(str) {
    return encodeURIComponent(String(str).replace(/(?:\r\n|\r|\n)/g,"<CR>"));
}

class Bee {
    constructor() {
        this.version = '';
        this.key = '';
        this.uploadURL = 'http://letsgo.e.weibo.com/stracker/fe/report';
        this.plugins = [];
        this.inited = false;
    }

    init(opts = {}) {
        if (this.inited) {
            this.plugins.forEach(plugin => {
                plugin.config(this.send, opts[plugin.name]);
            })
            return;
        }
        this.key = (opts && opts.key) || this.key;
        this.uploadURL = (opts && opts.uploadURL) || this.uploadURL;
        Object.keys(opts).map(k => {
            if (plugins[k]) {
                this.plugins.push(new plugins[k](this.send, opts[k], k));
            }
        });
        this.inited = true;
    }

    send = (data) => {
        let url = this.uploadURL.indexOf('?') < 0 ? this.uploadURL + '?' : this.uploadURL;
        url += 'key=' + this.key;
        url += this.version ? '&v=' + this.version : '';

        let leftVarsLen = MAX_STORE_SIZE - url.length;
        let sendList = [];

        Object.keys(data).map(key => {
            let value = data[key];
            let query;
            if (type(value) === "array") {
                query = "&" + key + "=" + doEscape(value.join(BEE_SEPERATOR));
            } else {
                query = "&" + key + "=" + doEscape(value);
            }
            sendList.push(query);
        });

        let queryParams = '';
        sendList.sort((a, b) => a.length < b.length ? -1 : 1).forEach(qry => {
            if (queryParams.length + qry.length > leftVarsLen) {
                if (!queryParams) { 
                    queryParams = qry;
                    qry = "";
                }
                sendByFakeImage(url + queryParams);
                queryParams = "";
            }
            queryParams += qry;
        });
        queryParams && sendByFakeImage(url + queryParams);
    }
}
if (setting.monitor && setting.monitor.key) {
    const bee =  new Bee();
    bee.init({
        spapv: {
            history: browserHistory
        },
        clicks: {
            history: browserHistory,
            hots: setting.monitor.hots || false
        },
        error: {},
        key: setting.monitor.key
    });
    window['__logger__'] = bee.send;
}
