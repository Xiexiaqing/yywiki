import { 
    REPOCH_DISPATH_ACTION, REPOCH_INIT_SUB_STORE 
} from './constant';

export default ({ getState, dispatch }) => next => action => {
    console.log('repoch')
    // exit early if action is a function
    if (typeof action === 'function' || action.type === REPOCH_INIT_SUB_STORE) {
        return next(action)
    }

    return next({ type: REPOCH_DISPATH_ACTION, payload: action });
}

