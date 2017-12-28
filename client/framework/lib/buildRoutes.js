import React from 'react';
import Route from 'react-router/lib/Route';
import Redirect from 'react-router/lib/Redirect';
import App from 'comps/App/App'
import routeConfig from 'routes/config.js';
import createRepochContainer from './createRepochContainer';
// import store from 'utils/store';

let storeInitActions = {};
let enterHandlers = {};
function buildRouteComponents() {
    let components = [];

    Object.keys(routeConfig['route']).map((route) => {
        let routeConf = routeConfig['route'][route];

        if (routeConf.on_enter) {
            enterHandlers[route] = require('routes/' + routeConf.on_enter)
        }

        if (routeConf.state_path) {
            storeInitActions[route] = routeConf.state_path;
            
        }

        components.push(
            <Route
                key={ route }
                path={ route }
                componentPath={ routeConf.component_path }
                pageTitle={ routeConf.title }
            />
        );
    });

    if (routeConfig['error_component_path']) {
        components.push(
            <Route
                key={ "__defaultErrorRouter__" }
                path={ "*" }
                componentPath={ routeConfig['error_component_path'] }
                pageTitle={ "出错啦" } />
        );
    }

    return components;
}

const routes = (
    <Route component={ App }>
        <Redirect key={ '__indexRoute__' } 
            from={ routeConfig['root'] || "/" } 
            to={ routeConfig['index_route'] || '/index' } />
        { buildRouteComponents() }
    </Route>
);

function walk(routes, cb) {
    cb(routes);
    if (routes.childRoutes) {
        routes.childRoutes.forEach(route => walk(route, cb));
    }

    return routes;
}

export default (connector, routingState) => {
    return walk(Route.createRouteFromReactElement(routes), route => {
        if (route.componentPath) {
            let oldOnEnter = route.onEnter || false;
            route.onEnter = (nextState, replaceState, goNext) => {
                // we can do login auth here
                if (oldOnEnter) {
                    oldOnEnter(nextState, replaceState);
                }

                function onEnterHandler(nextState, replaceState) {
                    if (enterHandlers[route.path]) {
                        return enterHandlers[route.path](nextState, replaceState);
                    } else {
                        return false;
                    }
                }

                Promise.all([onEnterHandler(nextState, replaceState)]).
                    then(result => {
                        if (!result[0]) {
                            let statePath = storeInitActions[route.path];
                            let needReset = true;

                            if (route.path && routeConfig.route[route.path]) {
                                let resetConf = routeConfig.route[route.path].need_reset;
                                needReset = resetConf !== false;
                            }
                            if (statePath && needReset) {
                                connector.reset(statePath.replace(/\//g, '.'));
                            }

                            goNext();
                        }
                    });
            };

            let oldOnLeave = route.onLeave || false;
            route.onLeave = () => {
                if (oldOnLeave) {
                    oldOnLeave();
                }

                routingState.setRoutingState(true);
                routingState.setFetchingState(true);
            };

            route.getComponent = function(nextState, cb) {
                document.title = route.pageTitle;

                function fillStore() {
                    let statePath = storeInitActions[route.path];
                    if (statePath) {
                        let action = statePath.replace(/\//g, '.') + '.initPage';
                        // let useCache = routingState.isBackward(nextState.location);
                        connector.createAction(action, function() {
                            routingState.setFetchingState(false);
                        }, nextState.location);
                    } else {
                        routingState.setFetchingState(false);
                    }
                }

                function fetchComponent() {
                    return new Promise(function(resolve) {
                        require("repoch!comps/" + route.componentPath)(comp => {
                            comp.storeChangeCallback = function(state) {
                                // store.set('state', state);
                            }
                            cb(null, createRepochContainer(comp, routingState, connector));
                            resolve();
                        });
                    });
                }

                fillStore();
                fetchComponent().then(() => {
                    routingState.setRoutingState(false, nextState.location)
                });
            };
        }
    });
};
