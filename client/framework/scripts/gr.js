var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var common = require("./utils/common");

var root = process.argv.length > 2 ? process.argv.pop() : process.cwd();
var routesConfig = require(path.join(root, 'routes', 'config'));
var projectConfig = require(path.join(root, 'config', 'project'));

var tmpl = {
    routes: [
        "import React from 'react';",
        "import Route from 'react-router/lib/Route';",
        "import Redirect from 'react-router/lib/Redirect';",
        "import App from 'comps/App/App';",
        "import { fetchNewComponent, needPageJump } from 'lib/router';",
        "<%= allRoutes %>",
        " ",
        "const routes = (",
        "    <Route component={ App }>",
        "       <Redirect from='<%= rootRoutePath %>' to='<%= indexRoutePath %>' />",
        "       <%= allRouteConfigs %>",
        "    </Route>",
        ");",
        " ",
        "function walk(routes, cb) {",
        "    cb(routes);",
        "    if (routes.childRoutes) {",
        "        routes.childRoutes.forEach(route => walk(route, cb));",
        "    }",
        "    ",
        "    return routes;",
        "}",
        " ",
        "export default (store) => {",
        "    return walk(Route.createRouteFromReactElement(routes), route => {",
        "        let oldOnLeave = route.onLeave || false;",
        "        route.onLeave = () => {",
        "            if (oldOnLeave) {",
        "                oldOnLeave();",
        "            }",
        "            store.dispatch(fetchNewComponent(true));",
        "            store.dispatch(needPageJump(true));",
        "        };",
        " ",
        "        route.store = store;",
        "    });",
        "};"
    ],
    config: [
        "import React from 'react';",
        "import { fetchNewComponent, needPageJump } from 'lib/router';",
        "import convertToSmartContainerComponent from 'lib/convertToSmartContainerComponent';",
        "<%if(state_path){%>import { initAllData } from '../../states/<%= state_path %>';<%}else{%>var initAllData = null; <%}%>",
        "<%if(on_enter){%>import enterHandler from '../../routes/<%= on_enter %>';<%}else{%>var enterHandler = null; <%}%>",
        " ",
        "const Route = {",
        "    path: '<%= path %>',",
        "    onEnter: function(nextState, replaceState) {",
        "        let store = this.store;",
        "        function onEnterHandler(nextState, replaceState) {",
        "            if (enterHandler) {",
        "                return enterHandler(nextState, replaceState);",
        "            } else {",
        "                return false;",
        "            }",
        "        }",
        "        Promise.all([onEnterHandler(nextState, replaceState)]).",
        "            then(result => store.dispatch(needPageJump(!!result[0])));",
        "    },",
        "    getComponent(location, cb) {",
        "        document.title = '<%= title %>';",
        "        var dispatch = this.store.dispatch;",
        "        function fillStore() {",
        "            if (initAllData) {",
        "                return dispatch(initAllData(location));",
        "            } else {",
        "                return Promise.resolve();",
        "            }",
        "        }",
        "        function fetchComponent() {",
        "            return new Promise(resolve => {",
        "                require.ensure([], require => {",
        "                    let component = require('../../comps/<%=component_path %>');",
        "                    cb(null, convertToSmartContainerComponent(component));",
        "                    resolve();",
        "                }, '<%=component_name %>');",
        "            });",
        "        }",
        "        Promise.all([fillStore(), fetchComponent()]).",
        "            then(() => dispatch(fetchNewComponent(false)));",
        "    }",
        "};",
        " ",
        "export default Route;"
    ]
};

function init() {
    // 生成tmp目录
    common.deleteFolderRecursive(root + '/_tmp');
    common.mkdirsSync(root + '/_tmp');

    // 生成route配置文件
    console.log('');
    console.log('*************************************');
    console.log('Start creating routes config file >>>>> _tmp/routes.js');
    console.log('*************************************');
    buildRoutesConfigFile();

    // 生成所有路由文件
    console.log('');
    console.log('*************************************');
    console.log('Start creating all components route file');
    console.log('*************************************');
    buildAllComponentRoutesFile();

    console.log('');
    console.log('*************************************');
    console.log('Create App Routes File Done!');
    console.log('*************************************');
}

function buildRoutesConfigFile() {
    var route_tpl = projectConfig.routes_tpl || tmpl.routes;
    var routeTemplate = _.template(route_tpl.join('\n'));
    var routeStr = routeTemplate({
        allRoutes: getImportRoutes(),
        allRouteConfigs: getRoutesConfig(),
        rootRoutePath: routesConfig['root'] || '/',
        indexRoutePath: routesConfig['index_route'] || '/index'
    });
    fs.writeFileSync(path.join(root, '_tmp', 'routes.js'), routeStr);
}

function buildAllComponentRoutesFile() {
    var index = 0;

    var temp = _.template(tmpl.config.join('\n'));
    for (var o in routesConfig['route']) {
        var str = temp({
            title: routesConfig['route'][o].title,
            component_path: routesConfig['route'][o].component_path,
            component_name: routesConfig['route'][o].component_path.split('/')[0] + index++,
            state_path: routesConfig['route'][o].state_path,
            on_enter: routesConfig['route'][o].on_enter,
            path: o
        });

        common.mkdirsSync(path.join(root, '_tmp', routesConfig['route'][o].component_path.replace(/\//g, '_')));
        fs.writeFileSync(path.join(root, '_tmp', routesConfig['route'][o].component_path.replace(/\//g, '_'), "index.js"), str);
    }

    if (routesConfig['error_component_path'] && fs.existsSync(path.join(root, 'comps', routesConfig['error_component_path'] + '.js'))) {
            var str = temp({
            title: '出错啦',
            component_path: 'Error/Error',
            component_name: 'Default_Error' + index++,
            state_path: false,
            on_enter: false,
            path: "*"
        });
        common.mkdirsSync(path.join(root, '_tmp', 'Default_Error_Error'));
        fs.writeFileSync(path.join(root, '_tmp', 'Default_Error_Error', 'index.js'), str);
    }
}

function getImportRoutes() {
    var tempArr = [];
    var index = 0;

    for (var o in routesConfig['route']) {
        tempArr.push("import Route" + index++ + " from './" + routesConfig['route'][o].component_path.replace(/\//g, '_') + "';");
    }
    if (routesConfig['error_component_path'] && fs.existsSync(path.join(root, 'comps', routesConfig['error_component_path'] + '.js'))) {
        tempArr.push("import Route" + index + " from './Default_Error_Error';");
    }

    return tempArr.join("\n");
}

function getRoutesConfig() {
    var tempArr = [];
    var index = 0;

    for (var o in routesConfig['route']) {
        tempArr.push("        <Route { ...Route" + index++ + " } />");
    }
    if (routesConfig['error_component_path'] && fs.existsSync(path.join(root, 'comps', routesConfig['error_component_path'] + '.js'))) {
        tempArr.push("        <Route { ...Route" + index + " } />");
    }

    return tempArr.join("\n");
}

if (routesConfig) {
    init();
} else {
    console.log("No routes config file");
    console.log("*****************************");
}
