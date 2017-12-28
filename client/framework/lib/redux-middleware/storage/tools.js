import setting from 'config/setting';

export function initUnloadEvent() {
    window.onunload = window.onbeforeunload = (function() {
        var didMyThingYet = false;

        return function() {
            if (didMyThingYet) { return; }
            didMyThingYet = true;

            let ls = window.localStorage;
            let ss = window.sessionStorage;

            if (!ls) { return; }

            let projectname = setting.monitor.key || '';
            if (!projectname) { return; }

            const PREFIX = 'LS_LAST_';

            let lastKey = ls.getItem(PREFIX + 'TIME') || '';
            let lastData = ls.getItem(PREFIX + lastKey) || '';

            if (lastData !== '') {
                doSend('fe_action_data=' + doEscape(lastData), PREFIX + lastKey, projectname);
            }
        }
    }());
}

export function isLuckyOne(uid) {
    if (uid === '') { return false; }

    var luck_num = uid[uid.length - 2];

    if (luck_num == '7') {
        return true;
    } 

    return false;
}

export function doEscape(str) {
    return encodeURIComponent(String(str).replace(/(?:\r\n|\r|\n)/g,"<CR>"));
}

export function doSend(requestParams, itemKey, projectname) {
    let url = 'http://letsgo.e.weibo.com/stracker/fe/report?';
    url += 'project_name=' + projectname + '&ctn=' + window.sessionStorage.getItem('ctn') + '&';
    url += requestParams;

    setTimeout(function() {
        sendByFakeImage(url);
        itemKey && window.localStorage.removeItem(itemKey);
        window.localStorage.removeItem('LS_LAST_TIME');
    }, 10);
}

export function sendByFakeImage(sendURL) {
    var img = new Image(1, 1);
    img.onload = img.onerror = img.onabort = function() {
        img.onload = img.onerror = img.onabort = null;
        img = null;
    };
    img.src = sendURL;
}