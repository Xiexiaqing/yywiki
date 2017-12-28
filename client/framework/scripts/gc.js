var fs = require('fs');
var co = require('co');
var _ = require('lodash');
var path = require('path');
var common = require("./utils/common");

var root = process.argv.pop();
var comps = path.join(root, 'comps/');
var states = path.join(root, 'states/');
var config = require(path.join(root, 'config/project'));
var routes_config = null;

if (fs.statSync(path.join(root, 'config/routes.js'))){
    routes_config = require(path.join(root, 'config/routes'));
}

var tmpl = {
    comps: [
        "import React from 'react';",
        " ",
        "export default class <%=name %> extends React.Component {",
        "    static subcribePropsFromStore = {",
        "    }",
        "    ",
        "    state = {",
        "    }",
        "    ",
        "    render() {",
        "        return (",
        "            <div>",
        "                <h1> <%=name %> </h1>",
        "            </div>",
        "        );",
        "    }",
        "}"
    ].join('\n'),
    state: [
        "import axios from 'utils/axios';",
        "//-----------------",
        "// constants block",
        "//-----------------",
        "const <%=stateName%>_INIT_DATA = '<%=stateName%>_INIT_DATA';",
        "const <%=stateName%>_AJ_ERROR = '<%=stateName%>_AJ_ERROR';",
        " ",
        "//-----------------",
        "// actions block",
        "//-----------------",
        "export function initAllData() {",
        "    return async (dispatch, getState) => {",
        "        try {",
        "            const { data: test } = await axios.get(`/aj/test`);",
        "            if (test.code === 100000) {",
        "                // do something",
        "                dispatch({ type: <%=stateName%>_INIT_DATA, data: test.data });",
        "            } else {",
        "                dispatch({ type: <%=stateName%>_AJ_ERROR, err: test.msg });",
        "            }",
        "        } catch (e) {",
        "            dispatch({ type: <%=stateName%>_AJ_ERROR, err: e.message });",
        "        }",
        "    };",
        "}",
        "export function resetErr(text = '') {",
        "    return {",
        "        type: <%=stateName%>_AJ_ERROR,",
        "        err: text",
        "    };",
        "}",
        " ",
        "//-----------------",
        "// reducer block",
        "//-----------------",
        "const initialState = {",
        "    err: '',",
        "    data: null",
        "};",
        " ",
        "export default (state = initialState, action) => {",
        "    switch (action.type) {",
        "        case <%=stateName%>_INIT_DATA:",
        "            return {",
        "                ...state,",
        "                data: action.data",
        "            };",
        "        case <%=stateName%>_AJ_ERROR:",
        "            return {",
        "                ...state,",
        "                err: action.err",
        "            };",
        "        ",
        "        default:",
        "            return state;",
        "    }",
        "};",
        " "
    ].join('\n')
};

/* 修改的文件：
 * comps/Hello/Hello.js
 * config/routes.js
 * state/hello/index.js
 * state/index.js
 */
function init() {
    if (!routes_config) {
        console.log('');
        console.log('ERROR>> MISSING config/routes.js');
        console.log('   YOU MUST HAVE routes.js UNDER config DIRECTORY');
        console.log('=====================================');
        return;
    }


    console.log('');
    console.log('START GENERATING ' + config.pages.length +' PAGES ');
    console.log('=====================================');

    var alreadyPages = [];
    var generatedPages = [];
    var errPages = [];

    for (var i = 0; i < config.pages.length; i++) {
        var component_name = config.pages[i].name;

        if (!component_name) {
            console.log('');
            console.log('ERROR>> GENERATE FILE ' + component_name + ' FAILED');
            console.log('=====================================');
            console.log('    THE RIGHT CONFIG FILE FORMAT!');
            console.log('');
            console.log('module.exports = {');
            console.log('    ... ');
            console.log('    pages: [');
            console.log('        {');
            console.log('            name: "Hello",');
            console.log('            route: "/hello",');
            console.log('            title: "哈喽",');
            console.log('            withState: true');
            console.log('        }');
            console.log('    ]');
            console.log('};');
            console.log('');
            break;
        }
        component_path = component_name;

        if (component_name.indexOf('/') > -1) {
            var componentArr = component_name.split('/');

            component_name =  componentArr[componentArr.length - 1];
        }

        component_name = replaceStr(component_name);

        console.log('');
        console.log('*************************************');
        console.log('NO. ' + (i + 1) + ' PAGE >>>>> ' + component_name);
        console.log('*************************************');

        var state_name = component_name.toLowerCase();

        if (fs.existsSync(comps + component_name)) {
            alreadyPages.push(component_name);
            console.log('');
            console.log('ERROR>> GENERATE FILE ' + component_name + ' FAILED');
            console.log('=====================================');
            console.log('    THE PAGE ' + component_name + ' IS ALREADY EXIT');
            continue;
        }

        createComponentFile(component_path, component_name, state_name, config.pages[i].withState);
        editRouteConfigFile(component_path, component_name, config.pages[i].route, config.pages[i].title, state_name, config.pages[i].withState);

        generatedPages.push(component_name);

        if (!config.pages[i].withState) {
            continue;
        }

        createStateFile(state_name);
        editReducerCombine(state_name);
        console.log('');
    }

    console.log('');
    console.log('GENERATING ALL PAGES COMPELETE!');
    console.log('=====================================');
    console.log('    ' + generatedPages.length + ' PAGES GENERATED SUCCESSFULLY!');
    console.log('    SUCCESSFUL PAGES: ' + generatedPages.join(','));
    console.log('');

    if (alreadyPages.length > 0) {
        console.log('    ' + alreadyPages.length + ' PAGES ALREADY EXITS!');
        console.log('    FAILED PAGES: ' + alreadyPages.join(','));
        console.log('');
    }

    if (errPages.length > 0) {
        console.log('    ' + errPages.length + ' PAGES HAVE NAMING PROBLEMS!');
        console.log('    ERROR PAGES: ' + errPages.join(','));
        console.log('');
    }
}

function editRouteConfigFile(component_path, component_name, route, title, state_name, withState) {
    console.log('');
    console.log('START EDITING CONFIG/ROUTES.JS ');
    console.log('=====================================');

    try {
        var routesFile = fs.readFileSync(root + '/config/routes.js').toString();
        var allLines = routesFile.split('\n');
        var newLines = [];
        var startFlag = false;
        var alreadyAddRoute = false;

        for (var i = 0; i < allLines.length; i++) {
            var curLine = allLines[i];

            if (/^\s*module\.exports/.test(curLine)) {
                startFlag = true;
                newLines.push(curLine);
                continue;
            }

            if (startFlag) {
                startFlag = false;

                newLines.push("    '" + route + "': {");
                newLines.push("        component_path: '" + component_path + "/" + component_name +"',");
                newLines.push("        title: '" + title + "',");
                if (withState) {
                    newLines.push("        state_path: '" + state_name + "/index'");
                } else {
                    newLines.push("        state_path: ''");
                }
                newLines.push("    },");
            }

            newLines.push(curLine);
        }

        fs.writeFileSync(root + '/config/routes.js', newLines.join('\n'));
        console.log('    FINISHED!');
        console.log('');
    } catch (e) {
        echoFailMsg(e);
    }
};

function createComponentFile(component_path, component_name, state_name, withState) {
    console.log('');
    console.log('START CREATING COMPONENT FILE ');
    console.log('=====================================');

    try {
        common.mkdirsSync(comps + component_path);

        var compsTemplate = _.template(tmpl.comps);
        var stateName = '';
        if (withState) {
            stateName = state_name;
        }

        var compsStr = compsTemplate({
            stateName: stateName,
            name: component_name
        });
        fs.writeFileSync(comps + component_path + '/' + component_name + '.js', compsStr);
        console.log('    FINISHED!');
        console.log('');
    } catch (e) {
        echoFailMsg(e);
    }
}

function createStateFile(state_name) {
    console.log('');
    console.log('START CREATING STATE FILE');
    console.log('=====================================');

    try {
        common.mkdirsSync(states + state_name);

        var stateTemplate = _.template(tmpl.state);
        var stateStr = stateTemplate({
            stateName: state_name.toUpperCase()
        });
        fs.writeFileSync(states + state_name + '/index.js', stateStr);
        console.log('    FINISHED!');
        console.log('');
    } catch (e) {
        echoFailMsg(e);
    }    
}

function editReducerCombine(state_name) {
    console.log('');
    console.log('START EDITING COMBINE REDUCER FILE');
    console.log('=====================================');

    try {
        var reducersFile = fs.readFileSync(states + '/index.js').toString();
        var allReducerLines = reducersFile.split('\n');
        var newReducerLines = [];
        var startFlag = false;

        for (var j = 0; j < allReducerLines.length; j++) {
            var curLine = allReducerLines[j];
            if (/^\s*import/.test(curLine)) {
                startFlag = true;
                newReducerLines.push(curLine);
                continue;
            }

            if (startFlag) {
                startFlag = false;
                newReducerLines.push("import " + state_name + " from './" + state_name + "';");
            }

            newReducerLines.push(curLine);

            if (/^\s*export\s+default/.test(curLine)) {
                newReducerLines.push('    ' + state_name + ',');
            }
        }

        fs.writeFileSync(states + '/index.js', newReducerLines.join('\n'));
        console.log('    FINISHED!');
        console.log('');
    } catch (e) {
        echoFailMsg(e);
    }    
}

function replaceStr(str){
     var reg = /\b(\w)|\s(\w)/g;
     return str.replace(reg,function(m){ 
          return m.toUpperCase();
     });
}

function echoFailMsg(e) {
    console.log('');
    console.log('ERROR>> GENERATE FILES FAILED!');
    console.log('=====================================');
    console.log('DETAIL: ' + e.message);
    console.log('');
    process.exit(1);
}

if (config.pages && config.pages.length > 0) {
    init();
} else {
    console.log('ERROR>> NO PAGES!');
    console.log('=====================================');
    console.log('YOU CAN EDIT config/project.js TO ADD A "pages"!');
    console.log('');
    console.log('module.exports = {');
    console.log('    ... ');
    console.log('    pages: [');
    console.log('        {');
    console.log('            name: "Hello",');
    console.log('            route: "/hello",');
    console.log('            title: "哈喽",');
    console.log('            withState: true');
    console.log('        }');
    console.log('    ]');
    console.log('};');
    console.log('');
}
