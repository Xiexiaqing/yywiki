import admin_trans from 'kits/trans/admin';
import setMsgToast from 'kits/setMsgToast';
import jsonToQuery from 'kits/jsonToQuery';
import { doJumpPage } from 'kits/io/redirect';

export function initPage() {
    return async (dispatch, getState) => {
        try {
            admin_trans.request('get_user_info', '').then(function(succ_res){
                dispatch({
                    type: 'MINE_INIT_DATA',
                    ...succ_res.data
                }); 
            }, function(err_res){
                dispatch({
                    type: 'MINE_MSG',
                    msg: err_res.msg || '网络错误，请稍后再试'
                });
            });
        } catch (e) {
            dispatch(setMsgToast(e.message));
        }
    };
}

export function doCheck(token, user_id) {
    return async (dispatch, getState) => {
        try {
            admin_trans.request('check_token', 't=' + encodeURIComponent(token)).then(function(succ_res){
                doJumpPage("/home");
            }, function(err_res){
                // token过期或错误
                dispatch({
                    type: 'MINE_MSG',
                    msg: err_res.msg || '网络错误，请稍后再试'
                });

                let user_list = window.localStorage.getItem('user_list');
                let user_obj = {};

                if (user_list) {
                    user_obj = JSON.parse(user_list);
                }
                
                delete user_obj[user_id];
                window.localStorage.setItem('user_list', JSON.stringify(user_obj));
                
                setTimeout(function() {
                    doJumpPage("/signin");
                }, 3000)
            });
        } catch (e) {
            dispatch(setMsgToast(e.message));
        }
    };
}

export function setMsg(msg) {
    return {
        type: "MINE_MSG",
        msg: msg
    };
};

//-----------------
// reducer block
//-----------------
export const initialState = {
    msg: '',
    birthday: "",
    user_id: "",
    feed_count: 0,
    data_center: {}
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case 'MINE_MSG':
            return {
                ...state,
                msg: action.msg
            };
        
        case 'MINE_INIT_DATA':
            return {
                ...state,
                birthday: action.birthday,
                user_id: action.user_id,
                feed_count: action.feed_count
            };
            
        default:
            return state;
    }
}
