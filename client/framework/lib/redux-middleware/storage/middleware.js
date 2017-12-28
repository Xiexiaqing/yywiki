import namelist from './namelist';
import setting from 'config/setting';
import queryToJson from 'utils/qs/queryToJson';
import getNetworkType from 'utils/weiboJSBridge/getNetworkType';
import { doEscape, doSend, initUnloadEvent, isLuckyOne } from './tools';

export default () => {
    initUnloadEvent();

    var networkType = '';
    getNetworkType({ onSuccess: function(res){ networkType = res; }});

    return ({ getState, dispatch }) => next => action =>{
        try {
            let uid = $CONFIG ? ($CONFIG.uid ? $CONFIG.uid : '') : '';
            if (!uid || networkType !== 'wifi') {
                next(action);
                return;
            }

            let inWhiteList = false;

            // if (!namelist.userWhiteList[uid] && !isLuckyOne(uid)) {
            if (namelist.userWhiteList[uid]) {
                inWhiteList = true;
            }

            let ls = window.localStorage;
            let ss = window.sessionStorage;

            if (!ls || !setting.monitor.key) {
                next(action);
                return;
            }

            const PROJECT_NAME = setting.monitor.key;
            const SEPERATOR = '|';
            const PREFIX = 'LS_LAST_';
            const MAX_STORE_SIZE = 2000;
            const DEFAULT_URL_LENGTH = 120;
            const PATCH_PARAMS_LENGTH = 50;
            const SESSION_PREFIX = 'SESSION_STORAGE_TAG';
            
            let key = new Date().getTime();
            let lastKey = ls.getItem(PREFIX + 'TIME') || key;
            let sessionId = ss.getItem(SESSION_PREFIX);

            if (!sessionId) {
                sessionId = key + uid;
                ss.setItem(SESSION_PREFIX, sessionId);
                let query = window.location.search.substr(1);
                ss.setItem('ctn', queryToJson(query).cnt || '');
            }

            // 当页面切换时，进行一次上报
            if (action.type.indexOf('REPOCH@@RESET') > -1 && action.state) {
                // 若存在则把缓存中的数据上报
                let lastData = ls.getItem(PREFIX + lastKey) || '';

                if (lastData !== '') {
                    doSend('fe_action_data=' + doEscape(lastData), PREFIX + lastKey, PROJECT_NAME);
                }

                next(action);
                return;
            }

            if (setting && setting.monitor.collect_action_list && !setting.monitor.collect_action_list[action.type]) {
                next(action);
                return;
            }

            // 获取上次的数据
            let lastData = ls.getItem(PREFIX + lastKey) || '';
            let formatA = inWhiteList ? action : { type: action.type };

            let nowData = JSON.stringify({ u: uid, s: sessionId, t: key, a: formatA, r: window.location.pathname, p: PROJECT_NAME });

            if (doEscape(lastData).length + doEscape(nowData).length + 3 < MAX_STORE_SIZE - DEFAULT_URL_LENGTH) {
                lastData = lastData !== '' ? (lastData + SEPERATOR + nowData) : nowData;
                key = lastKey;
                ls.setItem(PREFIX + key, lastData);
            } else {
                // 当上一个记录与现在的记录合并已经超过2000时，需要直接上报
                if (lastData !== '') {
                    doSend('fe_action_data=' + doEscape(lastData), PREFIX + lastKey, PROJECT_NAME);
                }

                /*
                 * 如果字符串总长度大于2000，则分段上传
                 * 2000字符是针对IE做的判断，所以暂时去掉此分段上传
                 */
                if (doEscape(nowData).length > MAX_STORE_SIZE - DEFAULT_URL_LENGTH) {
                    // let patchIdentify = new Date().getTime();
                    // let separate_num = MAX_STORE_SIZE - DEFAULT_URL_LENGTH - PATCH_PARAMS_LENGTH;
                    // let convertedData = doEscape(nowData);
                    // let t = Math.ceil(convertedData.length / separate_num);
                    // let i = 1;
                    // let requestParams = '';

                    // while(convertedData.length > 0) {
                    //     requestParams = 'part=' + doEscape(patchIdentify + '|' + i++ + '|' + t) + '&part_key=fe_action_data&part_data=' + convertedData.substr(0, separate_num);
                        doSend('fe_action_data=' + doEscape(nowData), PREFIX + lastKey, PROJECT_NAME);
                    // convertedData = convertedData.substring(separate_num);
                    // }
                } else {
                    ls.setItem(PREFIX + key, nowData);
                }
            }

            ls.setItem(PREFIX + 'TIME', key);

            next(action);
        } catch(e) {
            next(action);
        }
    };
};
