/* eslint-env node */
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const browserSync = require('browser-sync');
const webpackDevMiddleware = require('webpack-dev-middleware');
const colors = require('colors');
const _ = require('lodash');

const root = process.cwd();
const projectConfig = require(path.join(root, 'config', 'project'));
const mocks = path.join(root, 'mocks');
const config = require('./webpack/dev.config.babel')(root);
const bundler = webpack(config);
const port = projectConfig.devPort || 8081;

browserSync({
    server: {
        baseDir: '.',

        middleware: [
            webpackDevMiddleware(bundler, {
                publicPath: config.output.publicPath,
                stats: { colors: true},
                noInfo: false
            }),

            function (req, res, next) {
                res.setHeader("Access-Control-Allow-Origin", "*");

                if (/\.(js|css|png|jpg|jpeg|gif)/.test(req.url)) {
                    return next();
                }

                if (/\.(woff|woff2|ttf|eot|svg)/.test(req.url)) {
                    return next();
                }

                if (/statics\/(.+?)\.html$/.test(req.url)) {
                    return next();
                }

                var aj = req.url.split('?')[0];
                var allMocks = fs.readdirSync(mocks);

                for (var i = 0; i < allMocks.length; i++) {
                    var file = allMocks[i];

                    if (/\.json$/.test(file)){
                        var data = fs.readFileSync(path.join(mocks, file), 'utf-8');
                        data = data.replace(/[^http:]\/\/.+/g, "");
                        try{
                            var jsonObj = JSON.parse(data);
                        } catch (e){
                            console.log(mocks.red + path.sep + file.red + " JSON syntax error".red);
                        }

                        if (jsonObj[aj]) {
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify(jsonObj[aj]));
                            return next();
                        }
                    }
                }

                var tplPath = path.join(root, 'template.html');
                const source = fs.readFileSync(tplPath).toString();
                const template = _.template(source);
                res.write(template({ html: '' }));
                res.end();
            }
        ]
    },

    open: false,

    port: port,

    files: [
        'template.html'
    ],

    ui: {
        port: port + 1,
        weinre: {
            port: port + 2
        }
    }
});
