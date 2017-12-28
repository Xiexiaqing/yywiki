/* eslint-env commonjs */
/* global process */
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import ajaxMiddleware from './redux-middleware/ajax/middleware';
import storageMiddleware from './redux-middleware/storage/middleware';
import { reducer } from './coreRepochStore';

export class Reducer {
    constructor(initialReducers = {}) {
        this._reducers = {...initialReducers};
        this._emitChange = null;
    }

    register(newReducers) {
        let finalReducers = {};
        Object.keys(newReducers).map(function(key) {
            let reducerMethod = newReducers[key];
            finalReducers[key] = function reducer(state, action) {
                if (action.type === 'REPOCH@@RESET/' + key) {
                    return action.state;
                }
                return reducerMethod(state, action);
            };
        });

        this._reducers = {...this._reducers, ...finalReducers};
        if (this._emitChange != null) {
            this._emitChange(this.getReducers());
        }
    }

    getReducers() {
        return {...this._reducers}
    }

    setChangeListener(listener) {
        if (this._emitChange != null) {
            throw new Error('Can only set the listener for a ReducerRegistry once.');
        }
        this._emitChange = listener;
    }
}

export const repochReducer = new Reducer({
    repoch: reducer
});

export function createReduxStore(initialState = {}) {
    const middleware = [thunk, ajaxMiddleware, storageMiddleware()];

    if (process.env.NODE_ENV !== 'production') {
        middleware.push(createLogger({ collapsed: true }));
    }

    const store = createStore(
        combineReducers({ ...repochReducer.getReducers() }),
        initialState,
        applyMiddleware(...middleware)
    );

    // Reconfigure the store's reducer when the reducer registry is changed - we
    // depend on this for loading reducers via code splitting and for hot
    // reloading reducer modules.
    repochReducer.setChangeListener(function(reducers) {
        store.replaceReducer(combineReducers({
            ...reducers
        }))
    });

    return store;
}


