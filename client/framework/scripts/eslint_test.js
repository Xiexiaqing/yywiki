/*
 * eslint 检查代码语法
 */

'use strict';

var path = require('path');
var co = require('co');
var common = require('./utils/common');
var svn = require('./utils/svn');
var colors = require('colors');
var pack = process.cwd();

co(function*() {
    console.log('');
    console.log('CHECKING JAVASCRIPT SYNTAX......'.green);
    var cmd = [
        path.join(__dirname, "..", "node_modules", ".bin", "eslint") + " --c",
        path.join(__dirname, "..", ".eslintrc") + " --ignore-pattern \"**/_doc/**\"",
        "--ignore-pattern \"**/dist/**\" --ignore-pattern \"**/_tmp/**\"",
        "--ignore-pattern \"**/node_modules/**\" --ignore-pattern \"**/mocks/**\" --ignore-pattern \"**/statics/**\"",
        pack
    ].join(" ");
    console.log('CMD >>> '.green + cmd.bgGreen);
    console.log('=====================================');
    yield common.exec(cmd);
    console.log('');
    console.log('CHECKING JAVASCRIPT SYNTAX DONE'.green);
    console.log('');

    process.exit(0);
}).catch(function(e){
    console.log('packing error: ' + e.message + "\nstackinfo:" + e.stack);
    process.exit(1);
});
