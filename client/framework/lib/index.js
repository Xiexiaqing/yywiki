import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import Router from 'react-router/lib/Router';
import browserHistory from 'react-router/lib/browserHistory';
import initConnector from './connector';
import routes from './buildRoutes';
import setting from 'config/setting';
import * as OfflinePluginRuntime from 'offline-plugin/runtime';
OfflinePluginRuntime.install();

class routingState {
    constructor() {
        this.isChanging = true;
        this.isFetching = true;
        this.willJump = true;
        this.guid = 0;
        this.watcherList = [];
        this.href = "";
        this.loadedList = {};
    }

    _notifyChange = () => {
        Object.keys(this.watcherList).map(key => {
            let cb = this.watcherList[key];
            cb(this.isChanging, this.isFetching, this.loadedList)
        });
    }

    setRoutingState = (fetching, location) => {
        if (location) {
            this.loadedList[location.pathname] = true;
        }
        this.isChanging = fetching;
        this._notifyChange();
    }

    setFetchingState = (fetching) => {
        this.isFetching = fetching;
        this._notifyChange();
    }

    setHref = (href) => {
        this.href = href;
    }

    isBackward = (href) => {
        this.href = href;

        if (location.action !== "POP") {
            return false;
        }
// a-b-a
//         if (this.href === "") {
//             this.href = store.get('href');
//             if (window.location.href === this.href) {
//                 return true;
//             }
//         }

//          && 
//                         this.prevlocation === pathname + search) 
//                 {
//                     this.backBackButtonAction = true;
//                 } else {
//                     this.backBackButtonAction = false;
//                 }
    }

    observe = (watcher) => {
        let cursor = this.guid++;
        this.watcherList[cursor] = watcher;
        return () => {
            delete this.watcherList[cursor];
        };
    }
}

initConnector(function(connector) {
    ReactDOM.render(
        <Router
            history={ browserHistory }
            routes={ routes(connector, new routingState()) }
        />,
        document.getElementById('app')
    );
});


