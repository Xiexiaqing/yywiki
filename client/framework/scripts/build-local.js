/*
 * 前端代码打包、编译、合并
 */

'use strict';

var fs = require('fs');
var path = require('path');
var co = require('co');
var common = require('./utils/common');
var webpackBuild = require('./utils/webpack-build');

var root = process.cwd();
var config = require(path.join(root, 'config', 'project'));

function curentProductInfo() {
    var online = config.svn;
    // 创建临时文件夹用于下载上传SVN代码
    var pack = root;
    var dist = path.join(root, 'dist');

    return {
        svn: online,
        pack: pack,
        dist: dist
    };
}

co(function*() {
    var proinfo = yield curentProductInfo();
    yield webpackBuild(root, proinfo.pack, proinfo.dist, proinfo.svn);

    process.exit(0);
}).catch(function(e){
    console.log('packing error: ' + e.message + "\nstackinfo:".red + e.stack.bgRed);
    process.exit(1);
});
