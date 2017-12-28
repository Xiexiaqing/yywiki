var fs = require('fs');
var path = require('path');

module.exports = {
    inArray: function(item, arr){
        for(var i = 0, len = arr.length; i < len; i += 1){
            if(item === arr[i]){
                return true;
            }
        }
        return false;
    },
    parseParam: function(oSource, oParams, isown) {
        var key, obj = {};
        oParams = oParams || {};
        for (key in oSource) {
            obj[key] = oSource[key];
            if (oParams[key] != null) {
                if (isown) {// 仅复制自己
                    if (oSource.hasOwnProperty[key]) {
                        obj[key] = oParams[key];
                    }
                }
                else {
                    obj[key] = oParams[key];
                }
            }
        }
        return obj;
    },
    deleteFolderRecursive: function(path) {
        if(!fs.existsSync(path)) {
            return;
        }
        var files = fs.readdirSync(path);
        for (var i in files) {
            var file = files[i];
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                arguments.callee(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        };
        fs.rmdirSync(path);
    },
    copyFileRecursive: function(src, dst) {
        if (!fs.existsSync(src)){
            return;
        }

        if (!fs.statSync(src).isDirectory()) {
            var content = fs.readFileSync(src, 'binary');
            fs.writeFileSync(dst, content, 'binary');
            return;
        }

        if (!fs.existsSync(dst) || !fs.statSync(dst).isDirectory()) {
            fs.mkdirSync(dst);
        }

        var files = fs.readdirSync(src);
        for (var i in files) {
            var file = files[i];
            var srcPath = src + "/" + file;
            var dstPath = dst + "/" + file;
            arguments.callee(srcPath, dstPath);
        };
    },
    mkdirsSync: function(dirpath, mode){
        if (!(dirpath && fs.existsSync(dirpath) && fs.statSync(dirpath).isDirectory())) {
            arguments.callee(path.dirname(dirpath), mode);
            fs.mkdirSync(dirpath, mode);
        }
    },
    exec: function(cmd, opts) {
        return function(done) {
            var cp = require('child_process');
            var ex = cp.exec(cmd, opts, function(err, stdout, stderr) {
                done(err, stdout);
            });
            process.stdin.pipe(ex.stdin);
            ex.stdout.pipe(process.stdout);
            ex.stderr.pipe(process.stderr);
        };
    }
}