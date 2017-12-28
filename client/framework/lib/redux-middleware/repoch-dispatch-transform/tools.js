/**
 * Tools for ajax middleware
 *
 */

import AJAX_CALL from './AJAX_CALL';
import isPlainObject from 'lodash/isPlainObject';
import isFunction from 'lodash/isFunction';

export function isAjaxCall(action) {
    return action.hasOwnProperty(AJAX_CALL);
};

export function checkNecessaryParams(action) {
    const validMethods = [
        'GET',
        'HEAD',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS'
    ];
    let validErrors = [];

    let { 
        method, 
        headers, 
        data,
        onSuccess, 
        onError, 
        onFail
    } = action;

    // 检查url
    if (!action[AJAX_CALL]) {
        validErrors.push('[redux ajax middleware] url must not be null or undefined');
        return validErrors;
    }

    // 检查method
    if (method && validMethods.join(',').indexOf(method.toUpperCase()) === -1) {
        validErrors.push('[redux ajax middleware] invalid "method" : ' + method );
        return validErrors;
    }

    // 检查headers
    if (headers && !isPlainObject(headers)) {
        validErrors.push('[redux ajax middleware] header must be a plain JavaScript object');
        return validErrors;
    }

    if (onSuccess && !isFunction(onSuccess)) {
        validErrors.push('[redux ajax middleware] onSuccess must be a function');
        return validErrors;
    }

    if (onError && !isFunction(onError)) {
        validErrors.push('[redux ajax middleware] onError must be a function');
        return validErrors;
    }

    return validErrors;

};

export function onFail(res, next) {
    next({
        type: 'REPOCH_AJAX_FAILED',
        res: res
    });
};

