var path = require('path');
var fs = require('fs');
var express = require('express');
var app = express();
var root = process.cwd();
var projectConfig = require(path.join(root, 'config', 'project'));
var port = projectConfig.proPort || 8080;

// 静态文件的处理
app.use(function(req, res, next) {
    // 允许 Firefox、IE9 跨域访问自定义字体
    if (/\.(js|css|png|jpg|jpeg|gif|woff|woff2|ttf|eot|svg|manifest)/.test(req.url)) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        var file = path.join(root, req.url.split('?')[0]);
        if (file.lastIndexOf('.css') !== -1) {
            res.header('Content-Type', 'text/css');
        } else if (file.lastIndexOf('.js') !== -1) {
            res.header('Content-Type', 'text/javascript');
        }else if (file.lastIndexOf('.manifest') !== -1) {
            res.header('Content-Type', 'text/cache-manifest');
        }

        var resFile = fs.readFileSync(file);
        if (resFile) {
            return res.send(resFile);
        }

        return next();
    }

    var html = fs.readFileSync(path.join(root, 'dist', 'index.html'), 'utf8');
    return res.send(html);
});

app.server = app.listen(port);

console.log('weibo ria worker server ' + process.pid + ' running on ' + port + ' port...');


