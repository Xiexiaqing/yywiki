import axios from 'utils/axios';
import jsonToQuery from 'utils/qs/jsonToQuery';
import responseHandler from 'config/response';
import AJAX_CALL from './AJAX_CALL';

import { 
    isAjaxCall, checkNecessaryParams, onFailDefaultHandler
} from './tools';

var ajLock = {};
export default ({ getState, dispatch }) => next => action =>{
    // check if is an ajax call
    if (!isAjaxCall(action)) {
        return next(action);
    }

    // check all necessary params
    const paramErrors = checkNecessaryParams(action);

    // found errors
    if (paramErrors.length) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('[redux ajax middleware]' + paramErrors.join(';'));
        }

        return;
    }

    let {
        onSuccess, 
        onError,
        onFail,
        ...request
    } = action;
 
    let cache = JSON.stringify(request);
    if (ajLock[cache]) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('duplicated ajax request has been block by ajax middleware!');
        }
        return next(action);
    }
    ajLock[cache] = true;

    // do real ajax request
    try {
        let ajaxOpts = {
            method: request.method || 'GET',
            url: action[AJAX_CALL],
            headers: request.headers || {}
        };

        if (ajaxOpts.method.toUpperCase() === 'GET' || 
            ajaxOpts.method.toUpperCase() === 'DELETE' || 
            ajaxOpts.method.toUpperCase() === 'HEAD'
        ) {
            ajaxOpts.params = request.data;
        } else {
            ajaxOpts.data = request.data;
        }

        return axios(ajaxOpts).then(function(res) {
            delete ajLock[cache];

            let resData = res.data;
            if (res.status === 200) {
                if (resData.code === 100000) {
                    return onSuccess(resData, dispatch, getState);
                } else {
                    let nextData = typeof onFail === 'function' &&
                            onError(resData, dispatch, getState);

                    if (nextData) {
                        return next(nextData);
                    } else {
                        return responseHandler(resData);
                    }
                }
            }

            resData = { 
                code: res.status, 
                msg: resData ? resData.msg || resData.data.msg : '网路请求错误'
            };

            if (typeof onFail === 'function') {
                return onFail(resData, dispatch, getState);
            }

            return onFailDefaultHandler(resData, next);
        }, function(res) {
            delete ajLock[cache];

            let resData = res.data;
            resData = { 
                code: 109999, 
                msg: resData ? resData.msg || resData.data.msg : '网路请求失败'
            };

            if (typeof onFail === 'function') {
                return onFail(resData, dispatch, getState);
            }

            return onFailDefaultHandler(resData, next);
        });
    } catch (e) {
        delete ajLock[cache];

        let resData = { 
            code: 109998, 
            msg: e && e.message || '',
        };

        if (typeof onFail === 'function') {
            return onFail(resData, dispatch, getState);
        }

        return onFailDefaultHandler(resData, next);
    }
};
