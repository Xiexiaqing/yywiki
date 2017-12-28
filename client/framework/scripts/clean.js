/*
 * eslint 检查代码语法
 */

'use strict';

var path = require('path');
var common = require('./utils/common');
var colors = require('colors');
var root = process.cwd();

var dist = [path.join(root, 'dist'), path.join(root, '_tmp')];

console.log('');
console.log('CLEANING TEMPORARY FOLDERS......'.green);
console.log('TEMPORARY FOLDERS >>> '.green + JSON.stringify(dist).bgGreen);
console.log('=====================================');
console.log('');
dist.forEach(function(dir) {
    common.deleteFolderRecursive(dir);
});
console.log('');
console.log('CLEANING TEMPORARY FOLDERS DONE'.green);
console.log('');