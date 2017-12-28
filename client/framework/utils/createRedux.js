/* eslint-env commonjs */
/* global process */
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
const reducer = require("states");

export function createRedux(initialState) {
    const middleware = [thunk];

    if (process.env.NODE_ENV !== 'production') {
        middleware.push(createLogger({
            collapsed: true
        }));
    }

    const store = createStore(
        reducer,
        initialState,
        applyMiddleware(...middleware)
    );

    return store;
}
