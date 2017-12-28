/*
    deploy
    @Author: zhangyu19
    params: -host 测试开发机,默认131
            -port 端口，默认端口8874（rsync端口）
            -dir 目标目录
    Example: npm run deploy -host=10.210.241.131 -port=8874
*/

var co = require('co');
var colors = require('colors');
var common = require('./utils/common');
var path = require('path');
var root = process.cwd();
var testEnv = require(path.join(root, 'config', 'project')).testEnv || {};
var host = process.env.npm_config_host || testEnv.host || '';
var port = process.env.npm_config_port || testEnv.port || '8874';
var dir = process.env.npm_config_dir || testEnv.dir || '';

co(function*() {
    if (!host || !port) {
        console.log("请带参数执行命令，例如：npm run deploy -host=10.210.241.131 -port=8874".red);
        console.log("或".red);
        console.log("在config/project中配置参数：".red);
        console.log("    testEnv: {".red);
        console.log("        host: '10.210.241.131',".red);
        console.log("        port: '8874'".red);
        console.log("        dir: 'crowdfunding'".red);
        console.log("    }".red);
        process.exit(0);
    }

    if (!/((?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d))/.test(host)) {
        console.log("host：" + host + " 格式不正确，正确格式如10.210.241.131。".red);
        process.exit(0);
    }
    var source = path.join(root, 'dist');
    var cmd = `rsync -r --progress --delete ${source}/ rsync://${host}:${port}/rsync/${dir}/`;
    console.log(cmd)
    try {
        yield common.exec(cmd, { maxBuffer: 5000 * 1024 });
    } catch (e) {
        if (String(e.message).indexOf('E170000') > -1) {
            return -1;
        }
        console.log('NODE ERROR>>> ' + e);
        console.log('STDERR>>> ' + e);
        process.exit(1);
    }
    console.log('部署成功 '.green);
    process.exit(0);
}).catch(function(e){
    console.log('packing error: ' + e.message + "\nstackinfo:".red + e.stack.bgRed);
    process.exit(1);
});
