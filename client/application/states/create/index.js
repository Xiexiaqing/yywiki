import admin_trans from 'kits/trans/admin';
import { doJumpPage } from 'kits/io/redirect';
import setMsgToast from 'kits/setMsgToast';
import jsonToQuery from 'kits/jsonToQuery';
import axios from 'utils/axios';

export function initPage() {
    return async (dispatch, getState) => {
    };
}

export function createFeed(form_data) {
    return async (dispatch, getState) => {
        try {
            
        } catch (e) {
            dispatch(setMsgToast(e.message));
        }
    };
}

export function setMsg(msg) {
    return {
        type: "AUDIT_SETTING_UPDATE_MSG",
        msg: msg
    };
};

//-----------------
// reducer block
//-----------------
export const initialState = {
    msg: '',
    leave: []
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case 'AUDIT_SETTING_UPDATE_MSG':
            return {
                ...state,
                msg: action.msg
            };
            
        default:
            return state;
    }
}
