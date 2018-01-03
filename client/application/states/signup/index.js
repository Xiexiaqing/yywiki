import admin_trans from 'kits/trans/admin';
import setMsgToast from 'kits/setMsgToast';
import jsonToQuery from 'kits/jsonToQuery';
import { doJumpPage } from 'kits/io/redirect';

export function initPage() {
    return async (dispatch, getState) => {
        try {
        } catch (e) {
            dispatch(setMsgToast(e.message));
        }
    };
}

export function doSignup(post_data) {
    return async (dispatch, getState) => {
        try {
            admin_trans.request('signup', jsonToQuery(post_data)).then(function(succ_res){
                doJumpPage("/signin");
            }, function(err_res){
                dispatch({
                    type: 'SIGN_UP_MSG',
                    msg: err_res.msg || '网络错误，请稍后再试'
                });
            });
        } catch (e) {
            dispatch(setMsgToast(e.message));
        }
    };
}

export function setMsg(msg) {
    return {
        type: "SIGN_UP_MSG",
        msg: msg
    };
};

//-----------------
// reducer block
//-----------------
export const initialState = {
    msg: ''
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case 'SIGN_UP_MSG':
            return {
                ...state,
                msg: action.msg
            };
            
        default:
            return state;
    }
}
