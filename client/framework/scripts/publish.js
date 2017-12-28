/*
 * 提交代码到GIT上线目录
 */

'use strict';

var fs = require('fs');
var path = require('path');
var co = require('co');
var colors = require('colors');
var common = require('./utils/common');
var git = require('./utils/git');
var root = process.cwd();
var config = require(path.join(root, 'config', 'project'));
var dirLists = root.split(path.sep);
var suffix = dirLists.pop() || dirLists.pop();

function getReleasePath() {
    var gitPathSpilt = config.git.split('/');
    var projectName = gitPathSpilt[gitPathSpilt.length - 1].split('.')[0];

    gitPathSpilt.pop();
    gitPathSpilt.push(projectName + '_release.git')

    var releasePath = gitPathSpilt.join('/');

    return {
        releasePath: releasePath,
        projectName: projectName
    };
}

function *curentProductInfo() {
    var releasePath = getReleasePath().releasePath;
    var projectName = getReleasePath().projectName;

    // 创建临时文件夹用于下载上传GIT代码
    var to = path.join(root, '../../../' + projectName + '_release/');
    var from = path.join(root, 'dist');

    console.log('');
    console.log('MAKING TEMPORARY FOLDERS......');
    console.log('TEMP FOLDERS >>> ' + to);
    console.log('=====================================');
    console.log('');

    common.deleteFolderRecursive(to);
    // common.mkdirsSync(to);

    console.log('');
    console.log('MAKING TEMPORARY FOLDERS DONE');
    console.log('');
    return {
        'gitonline' : releasePath,
        'diskdev'   : from,
        'diskonline': to
    };
}

function copyFile(src, dst) {
    var file = fs.readFileSync(src, 'binary');
    fs.writeFileSync(dst, file, 'binary');
}

function copyStaticFile(src, dst) {
    if (/\/css\//.test(src)) return;
    var file = fs.readFileSync(src, 'binary');
    fs.writeFileSync(dst, file, 'binary');
}

function getFileList(dist, diskonline, callback) {
    if (!fs.existsSync(dist)) return;
    if (fs.statSync(dist).isDirectory()) {

        if (diskonline) {
            common.mkdirsSync(diskonline);
        } 

        var dirList = fs.readdirSync(dist);
        dirList.forEach(function(dir) {
            if (dir[0] === '.' || dir[0] === '_') return;
            getFileList(path.join(dist, dir), diskonline ? path.join(diskonline, dir) : false, callback);
        });
    } else if (fs.statSync(dist).isFile()) {
        // 忽略这些文件格式
        if (/\.(jade|sass|scss|less|map|psd|ai|html|manifest)$/.test(dist)) {
            if (dist.indexOf('server.js.map') < 0) {
                return;
            }
        }
        callback(dist, diskonline);
    }
}

function removeOutOfDateFile(path, flag) {
    var files = fs.readdirSync(path);
    for (var i in files) {
        var file = files[i];
        if (file[0] === '.' && !flag) continue;
        var curPath = path + "/" + file;
        if(fs.statSync(curPath).isDirectory()) { // recurse
            removeOutOfDateFile(curPath);
        } else { // delete file
            fs.unlinkSync(curPath);
        }
    }
}

function getRsyncCommand(diskonline) {
    var serverRsync = config.server && config.server.rsync;

    if (!serverRsync) return null;
    if (!serverRsync.ip || !serverRsync.port) return null;
    var cmd = [
        'rsync', 
        '--progress',
        path.join(diskonline, config.appName, 'server', 'server.js'),
        path.join(diskonline, config.appName, 'server', 'server.js.map'),
        `rsync://${serverRsync.ip}:${serverRsync.port}/${serverRsync.path || ''}`
    ];
    return cmd.join(' ');
}

co(function*() {
    var proinfo = yield curentProductInfo();
    var diskonline = proinfo.diskonline;
    var dist = proinfo.diskdev;

    var res = yield git.clone(proinfo.gitonline, diskonline);

    removeOutOfDateFile(diskonline + config.appName);

    console.log('');
    console.log('MOVING BUILD FILES......');
    console.log('=====================================');
    getFileList(dist, diskonline + '/' + suffix, copyFile);
    console.log('');
    console.log('MOVING BUILD DONE');
    console.log('');

    // git commit & push
    try {
        yield git.add(diskonline);

        yield git.commit(diskonline, 'js commit for release');
        yield git.push(diskonline, 'origin', 'master')
    } catch(e) {
        console.log(e)
        console.log(e.stack)
    }

    console.log('');
    console.log('PUBLISH GIT RELEASE SUCCESS'.green);
    console.log('=====================================');

    // let rsyncCommand = getRsyncCommand(diskonline);
    // if (!rsyncCommand) {
    //     console.log(rsyncCommand);
    //     try {
    //         yield common.exec(rsyncCommand, { maxBuffer: 5000 * 1024 });
    //     } catch (e) {
    //         console.log('RSYNC server.js server.js.map ERROR' + e);
    //     }
    // }

    // 清理下历史文件夹
    common.deleteFolderRecursive(diskonline);

    console.log('');
    console.log('PUBLISH SUCCESS'.green);
    console.log('=====================================');
    process.exit(0);
}).catch(function(e){
    console.log('packing error: ' + e.message + "\nstackinfo:" + e.stack);
    process.exit(1);
});
