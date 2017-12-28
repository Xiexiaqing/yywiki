/**
 * SVN操作
 */
var common = require("./common");

exports.checkout = function*(svnDir, diskDir) {
    console.log('');
    console.log('FINDING PRODUCTION SVN ' + svnDir);
    console.log('CHECKING OUT SVN......');
    console.log('=====================================');
    console.log('');
    var args = [];
    args.push("svn");
    args.push("co"); // svn命令
    args.push(svnDir); // svn目录
    args.push(diskDir); // 检出的目录
    try {
        var cmd = yield common.exec(args.join(' '), { maxBuffer: 5000 * 1024 })
    } catch (e) {
        if (String(e.message).indexOf('E170000') > -1) {
            return -1;
        }
        console.log('SVN CO ERROR>>> ' + args.join(' '));
        console.log('NODE ERROR>>> ' + e);
        console.log('STDERR>>> ' + e);
        process.exit(1);
    }
    return true;
};

exports.export = function*(svnDir, diskDir) {
    console.log('');
    console.log('FINDING PRODUCTION SVN ' + svnDir);
    console.log('EXPORTING SVN......');
    console.log('=====================================');
    console.log('');
    var args = [];
    args.push("svn");
    args.push("export"); // svn命令
    args.push(svnDir); // svn目录
    args.push(diskDir); // 检出的目录
    try {
        var cmd = yield common.exec(args.join(' '), { maxBuffer: 5000 * 1024 })
    } catch (e) {
        if (String(e.message).indexOf('E170000') > -1) {
            return -1;
        }
        console.log('SVN EXPORT ERROR>>> ' + args.join(' '));
        console.log('NODE ERROR>>> ' + e);
        console.log('STDERR>>> ' + e);
        process.exit(1);
    }
    return true;
};

exports.add = function*(diskDir) {
    console.log('');
    console.log('ADDING MODIFY TO SVN ' + diskDir);
    console.log('=====================================');
    console.log('');
    var args = [];
    args.push("svn");
    args.push("add"); // svn命令
    args.push(diskDir);
    args.push('--force');
    try {
        var cmd = yield common.exec(args.join(' '))
    } catch (e) {
        console.log('SVN ADD ERROR>>> ' + args.join(' '));
        console.log('NODE ERROR>>> ' + e);
        console.log('STDERR>>> ' + e);
        process.exit(1);
    }
    return;
};

exports.del = function*(diskDir) {
    console.log('');
    console.log('DELETING FILES FROM SVN ' + diskDir);
    console.log('=====================================');
    console.log('');
    var shellCMD = process.platform === 'win32' ?
        "for /f \"tokens=2\" %i in ('svn status " + diskDir + " ^| find \"!\" ') do set /a a+=1" :
        'svn status ' + diskDir + " | grep '!' | awk '{print $2}' | wc -l";
    try {
        var cmd = yield common.exec(shellCMD);
    } catch (e) {
        console.log('SVN DEL ERROR>>> ' + shellCMD);
        console.log('NODE ERROR>>> ' + e);
        console.log('STDERR>>> ' + e);
        process.exit(1);
    }

    var diffNum = process.platform === 'win32' ? cmd.split("\n").pop() : Number(cmd);
    if (diffNum > 0) {
        var shellCMD = process.platform === 'win32' ?
            "for /f \"tokens=2\" %i in ('svn status " + diskDir + " ^| find \"!\" ') do svn del %i" :
            'svn status ' + diskDir + " | grep '!' | awk '{print $2}' | xargs svn del";
        try {
            var res = yield common.exec(shellCMD);
        } catch (e) {
            console.log('SVN DEL ERROR>>> ' + args.join(' '));
            console.log('NODE ERROR>>> ' + e.stack);
            process.exit(1);
        }
    }
};

exports.commit = function*(diskDir) {
    console.log('');
    console.log('COMMITTING TO SVN ' + diskDir);
    console.log('=====================================');
    console.log('');
    var args = [];
    args.push("svn");
    args.push("ci"); // svn命令
    args.push(diskDir); // svn目录
    args.push('-m "js for release"');
    try {
        var cmd = yield common.exec(args.join(' '));
    } catch (e) {
        console.log('SVN CI ERROR>>> ' + args.join(' '));
        console.log('NODE ERROR>>> ' + e.stack);
        process.exit(1);
    }
};

exports.update = function*(diskDir) {
    console.log('');
    console.log('UPDATEING FROM SVN ' + diskDir);
    console.log('=====================================');
    console.log('');
    var args = [];
    args.push("svn");
    args.push("update"); // svn命令
    args.push(diskDir); // svn目录
    try {
        var cmd = yield common.exec(args.join(' '));
    } catch (e) {
        console.log('SVN UP ERROR>>> ' + args.join(' '));
        console.log('NODE ERROR>>> ' + e.stack);
        process.exit(1);
    }
};

exports.cleanup = function*(diskDir) {
    console.log('');
    console.log('CLEANUP SVN ' + diskDir);
    console.log('=====================================');
    console.log('');
    var args = [];
    args.push("svn");
    args.push("cleanup"); // svn命令
    args.push(diskDir);
    try {
        var cmd = yield common.exec(args.join(' '));
    } catch (e) {
        console.log('SVN CLEANUP ERROR>>> ' + args.join(' '));
        console.log('NODE ERROR>>> ' + e.stack);
        process.exit(1);
    }
};

exports.ls = function*(svndir) {
    console.log('');
    console.log('LS SVN ' + svndir);
    console.log('=====================================');
    console.log('');
    var args = [];
    args.push("svn");
    args.push("ls --verbose"); // svn命令
    args.push(svndir);
    try {
        var cmd = yield common.exec(args.join(' '));
    } catch (e) {
        console.log('SVN LS ERROR>>> ' + args.join(' '));
        console.log('NODE ERROR>>> ' + e.stack);
        process.exit(1);
    }
    
    return cmd;
};

exports.switch = function*(svndir) {
    console.log('');
    console.log('SWITCH SVN ' + svndir);
    console.log('=====================================');
    console.log('');
    var args = [];
    args.push("svn");
    args.push("switch"); // svn命令
    args.push(svndir);
    args.push('-m "js for release"');
    try {
        var cmd = yield common.exec(args.join(' '));
    } catch (e) {
        console.log('SVN LS ERROR>>> ' + args.join(' '));
        console.log('NODE ERROR>>> ' + e.stack);
        process.exit(1);
    }
    
    return cmd;
};

exports.copy = function*(src, dst) {
    console.log('');
    console.log('COPY SVN FROM: ' + src + ', TO: ' + dst);
    console.log('=====================================');
    console.log('');
    var args = [];
    args.push("svn");
    args.push("copy --parents"); // svn命令
    args.push(src);
    args.push(dst);
    args.push('-m "js for release"');
    try {
        var cmd = yield common.exec(args.join(' '));
    } catch (e) {
        console.log('SVN COPY ERROR>>> ' + args.join(' '));
        console.log('NODE ERROR>>> ' + e.stack);
        process.exit(1);
    }
    
    return cmd;
};

exports.mkdir = function*(dir) {
    console.log('');
    console.log('MAKE DIR TO SVN ' + dir);
    console.log('=====================================');
    console.log('');
    var args = [];
    args.push("svn");
    args.push("mkdir --parents"); // svn命令
    args.push(dir); // svn目录
    args.push('-m "js for release"');
    try {
        var cmd = yield common.exec(args.join(' '));
    } catch (e) {
        console.log('SVN MKDIR ERROR>>> ' + args.join(' '));
        console.log('NODE ERROR>>> ' + e.stack);
        process.exit(1);
    }
};

