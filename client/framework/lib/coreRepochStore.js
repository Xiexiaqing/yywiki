/* eslint-env commonjs */
/* global process */
/* global window: false */

export function setMsg(msg) {    
    return {
        type: 'REPOCH_MSG',
        msg: msg || ''
    };
}

export function setHref(location) {    
    return {
        type: 'REPOCH_SET_HREF',
        location: location
    };
}

const initialState = {
    msg: "",
    location: ""
};
 
export function reducer(state = initialState, action) {
    switch (action.type) {
        case 'REPOCH_MSG':
            return {
                ...state,
                msg: action.msg
            };

        case 'REPOCH_SET_HREF':
            return {
                ...state,
                location: action.location
            };

        default:
            return state;
    }
}

export default {
    setMsg,
    setHref,
    reducer
};


