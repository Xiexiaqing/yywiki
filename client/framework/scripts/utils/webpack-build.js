'use strict';

var fs = require('fs');
var path = require('path');
var co = require('co');
var common = require('./common');
var svn = require('./svn');
var colors = require('colors');

module.exports = function*(rootPath, pack, dist, svnPath, opts) {
    console.log('');
    console.log('MAKING DIST FOLDERS......'.green);
    console.log('DIST FOLDERS >>> '.green + dist.bgGreen);
    console.log('=====================================');
    console.log('');
    common.deleteFolderRecursive(dist);
    console.log('');
    console.log('MAKING DIST FOLDERS DONE'.green);
    console.log('');

    if (rootPath === pack) {
        console.log('');
        console.log('COMPILE FROM LOCAL DIR!'.red);
        console.log('');
    } else {
        console.log('');
        console.log('MAKING TEMPORARY FOLDERS......'.green);
        console.log('TEMP FOLDERS >>> '.green + pack.bgGreen);
        console.log('=====================================');
        console.log('');
        common.deleteFolderRecursive(pack);
        console.log('');
        console.log('MAKING TEMPORARY FOLDERS DONE'.green);
        console.log('');

        var res = yield svn.export(svnPath, pack);
        if (res === -1) {
            console.log('');
            console.log('SVN ERROR!!'.red);
            console.log('you must set correct "svn" path!'.red);
            console.log('check your config file: '.red + path.join(rootPath, 'config', 'project'));
            console.log('');
            process.exit(1);
        }
    }

    // console.log('');
    // console.log('CHECKING JAVASCRIPT SYNTAX......'.green);
    // var cmd = [
    //     path.join(__dirname, "..", "..", "node_modules", ".bin", "eslint") + " --c",
    //     path.join(__dirname, "..", "..", ".eslintrc") + " --ignore-pattern \"**/_doc/**\"",
    //     "--ignore-pattern \"**/dist/**\" --ignore-pattern \"**/_tmp/**\"",
    //     "--ignore-pattern \"**/node_modules/**\" --ignore-pattern \"**/mocks/**\"",
    //     pack
    // ].join(" ");
    // console.log('CMD >>> '.green + cmd.bgGreen);
    // console.log('=====================================');
    // yield common.exec(cmd);
    // console.log('');
    // console.log('CHECKING JAVASCRIPT SYNTAX DONE'.green);
    // console.log('');

    console.log('');
    console.log('COMPILING AND PACKING JAVASCRIPT......'.green);
    var cmd = [
        path.join(__dirname, "..", "..", "node_modules", ".bin", "cross-env") + " ",
        "DEBUG=" + (process.env.DEBUG || true),
        "CODE_ROOT=" + pack + ' ABTEST=' + ((opts && opts.ABTEST) || false),
        "BUNDLE=client NODE_ENV=production",
        path.join(__dirname, "..", "..", "node_modules", ".bin", "webpack"),
        "--config",
        path.join(__dirname, "..", "..", "webpack", "prod.config.babel.js") + "",
        "--display-error-details --progress"
    ].join(" ");
    console.log('CMD >>> '.green + cmd.bgGreen);
    console.log('=====================================');
    yield common.exec(cmd);
    console.log('');
    console.log('CHECKING JAVASCRIPT SYNTAX DONE'.green);
    console.log('');

    if (rootPath === pack) {
        return;
    }

    console.log('');
    console.log('GENERATING COMPILED FILES......'.green);
    console.log('=====================================');
    common.copyFileRecursive(path.join(pack, 'dist'), dist);
    console.log('');
    console.log('GENERATING COMPILED FILES'.green);
    console.log('');

    console.log('');
    console.log('DELETING TEMPORARY FOLDERS......'.green);
    console.log('=====================================');
    common.deleteFolderRecursive(pack);
    console.log('');
    console.log('DELETING TEMPORARY FOLDERS DONE'.green);
    console.log('');
}

