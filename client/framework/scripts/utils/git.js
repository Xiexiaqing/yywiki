/**
 * git操作
 */
var common = require("./common");
var colors = require('colors');

exports.clone = function*(gitDir, diskDir, opts) {
    console.log('');
    console.log('GIT CLONE......');
    console.log('FROM ' + gitDir);
    console.log('to ' + diskDir);
    console.log('=====================================');

    var args = [];
    args.push("git");
    args.push("clone");
    opts && args.push(' ' + opts);
    args.push(gitDir); // git
    args.push(diskDir); // 本地目录

    try {
        var cmd = yield common.exec(args.join(' '));
    } catch (e) {
        authorityErr(e);
        console.log('NODE ERROR>>> ' + e);
        console.log('STDERR>>> ' + e);
        process.exit(1);
    }

    return;
}

exports.rm = function*(dir, diskDir) {
    console.log('');
    console.log('GIT RM......');
    console.log('=====================================');
    var args = [];
    args.push("git");
    args.push("rm");
    args.push("-r"); // git
    args.push(dir); // 本地目录
    try {
        var cmd = yield common.exec(args.join(' '), {
            cwd: diskDir
        });
    } catch (e) {
        authorityErr(e);
        console.log('NODE ERROR>>> ' + e);
        console.log('STDERR>>> ' + e);
        process.exit(1);
    }
    return;
}

exports.add = function*(diskDir) {
    console.log('');
    console.log('GIT ADD......');
    console.log('=====================================');
    console.log('');
    var args = [];
    args.push("git");
    args.push("add");
    args.push('.');
    try {
        var cmd = yield common.exec(args.join(' '), {
            cwd: diskDir
        });
    } catch (e) {
        authorityErr(e);
        console.log('NODE ERROR>>> ' + e);
        console.log('STDERR>>> ' + e);
        process.exit(1);
    }
}

exports.commit = function*(diskDir, msg) {
    console.log('');
    console.log('GIT COMMIT......');
    console.log('=====================================');
    console.log('');
    var args = [];
    args.push("git");
    args.push("commit");
    args.push('-m');
    args.push('\'' + msg + '\'');

    try {
        var cmd = yield common.exec(args.join(' '), {
            cwd: diskDir
        });
    } catch (e) {
        if (e.code === 1) {
            console.log('打包后的代码无变化，无需提交'.green);
            console.log('=====================================');
            return;
        }
        authorityErr(e);
        console.log('NODE ERROR>>> ' + e);
        console.log('STDERR>>> ' + e);
        process.exit(1);
    }
}

exports.push = function*(diskDir, remote, branch) {
    console.log('');
    console.log('GIT PUSH......');
    console.log('=====================================');
    console.log('');
    var args = [];
    args.push("git");
    args.push("push");
    args.push(remote || '');
    args.push(branch || '');
    try {
        var cmd = yield common.exec(args.join(' '), {
            cwd: diskDir
        });
    } catch (e) {
        authorityErr(e);
        console.log('NODE ERROR>>> ' + e);
        console.log('STDERR>>> ' + e);
        process.exit(1);
    }
}

function authorityErr(err) {
    if (/Authentication/g.test(err)){
        console.log('ERR: git Username or Password is wrong'.red);
    }
}