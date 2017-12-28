import {
    REPOCH_DISPATH_ACTION,
    REPOCH_INIT_SUB_STORE,
} from './redux-middleware/repoch-dispatch-transform/constant';

function getValueFromPath(state, keyPath) {
    var value = state;
    var keyLength = keyPath.length;
    if (keyLength === 0) return false;

    for (let i = 0; i < keyLength; i++) {
        if (!value.hasOwnProperty(keyPath[i])) {
            value[keyPath[i]] = i === keyLength ? undefined : {};
        }
        value = value[keyPath[i]];
    }

    return value;
}

export function createRootReducer(moduleList) {
    return function reducer(state, action) {
        switch (action.type) {
            case REPOCH_DISPATH_ACTION:
            console.log('REPOCH_DISPATH_ACTION', action)
                var type = action.payload.type;
                var module = type.toLowerCase().split('_').slice(0, -1);
                var finalReducer = moduleList[module.join('.')].reducer;
                var prevState, newState, subState;

                if (!finalReducer) {
                    if (process.env.NODE_ENV !== 'production') {
                        console.warn('can not load request state module! ' +
                            'rename your action name which based on your module name: ' +
                            'for example: your must name your action.type with the prefix "TEST_INDEX" ' +
                            'and append with a real action name that has only one word such as "TITLE" ' +
                            'in a state module in the path "state/test/index.js"'
                        )
                    }
                } else {
                    newState = Object.assign({}, ...state);
                    prevState = getValueFromPath(newState, module);
                    subState = finalReducer(prevState, action.payload);

                    if (prevState !== subState) {
                                                                console.log(5555,subState, prevState,state.error.index)

                        prevState = Object.assign(prevState, subState);
                    }
                }

                return newState

            case REPOCH_INIT_SUB_STORE:
                let subPath = action.subPath;
                console.log({...state})
                    newState = Object.assign({}, ...state);

                                console.log('REPOCHORE',newState,state)

                let subStore = getValueFromPath(newState, subPath.split('.'));

                if (process.env.NODE_ENV !== 'production') {
                    if (newState.repochmods.indexOf(subPath) > -1) {
                        console.warn('[createSubStore]already created: ' + subPath);
                    }
                }

                return {
                    ...newState,
                    repochmods: newState.repochmods.concat(subPath)
                }

            default:
                return state;
        }
    }
}

export function createSubStore(store, subPath) {
    console.log('createSubStore')
    store.dispatch({ type: REPOCH_INIT_SUB_STORE, subPath });
}


