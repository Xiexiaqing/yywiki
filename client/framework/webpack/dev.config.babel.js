/* eslint-env node */
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const RepochPlugin = require("./plugins/repoch-webpack-plugin");
const _ = require('lodash');

function buildDevHtml(root, tpl, prefix, title) {
    var template = _.template(tpl);

    fs.writeFileSync(path.join(root, 'template.html'), template({
        js: {
            vendor: null,
            app: prefix + 'js/app.js',
            inlineSource: null,
            bee: null
        },
        title: title,
        css: prefix + 'app.css',
        manifest: false,
        html: ''
    }));
}

function getFileList(src, callback) {
    if (!fs.existsSync(src)) return;
    if (fs.statSync(src).isDirectory()) {
        var dirList = fs.readdirSync(src);
        dirList.forEach(function(dir) {
            if (dir[0] === '.' || dir[0] === '_') return;
            getFileList(path.join(src, dir), callback);
        });
    } else if (fs.statSync(src).isFile()) {
        // 忽略这些文件格式
        if (/\.js$/.test(src)) {
            callback(src);
        }
    }
}

function checkConfigFile(root) {
    var content = 'module.exports = {};';
    ['response', 'setting'].forEach(function(file) {
        var filePath = path.join(root, 'config', file + '.js');
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, content);
        }
    });
}

module.exports = function(root) {
    const config = require(path.join(root, 'config', 'project'));
    
    var devPrefix = '/';
    if (config.devPrefix) {
        devPrefix = config.devPrefix.indexOf('//') === 0 ? config.devPrefix : ('//' + config.devPrefix);
        devPrefix = devPrefix.substr(-1) === '/' ? devPrefix.substring(0, -1) : devPrefix;
        devPrefix += devPrefix.split(':').length !== 2 && config.devPort && config.devPort != 80 ?
            (':' + config.devPort + '/') : '/';
    }

    buildDevHtml(root, config.tpl, devPrefix, config.title);

    const routeConf = require(path.join(root, 'routes', 'config'))
    var reserveList = [];
    var compsDependenceMap = {};
    var statesDependenceMap = {};
    Object.keys(routeConf.route).map(function (routePath) {
        var compPath = routeConf.route[routePath].component_path;
        if (compPath) {
            reserveList.push("comps" + path.sep + compPath.split('/').join(path.sep));
            compsDependenceMap["./" + compPath] = "./" + compPath;
        }
    });

    getFileList(path.join(root, 'states'), function(pathname) {
        var statePathList = pathname.split('states' + path.sep);
        statePathList.shift();
        var statePath = statePathList.join('states' + path.sep).slice(0, -3);
        reserveList.push("states" + path.sep + statePath);
        statePath = statePath.split(path.sep).join('/');
        statesDependenceMap["./" + statePath] = "./" + statePath;
    })

    checkConfigFile(root);

    return {
        debug: true,

        devtool: '#eval-source-map',

        context: path.join(__dirname, '..'),

        entry: {
            app: 'lib/index'
        },

        output: {
            path: path.join(__dirname, 'dist'),
            publicPath: devPrefix,
            filename: 'js/[name].js'
        },

        // worker: {
        //     output: {
        //         filename: "js/worker.js",
        //         chunkFilename: "js/[id].worker.js"
        //     }
        // },

        resolve: {
            root: [
                root, path.join(__dirname, '..'), __dirname,
                path.join(__dirname, '..', 'node_modules'),
                path.join(root, 'statics')
            ],
            alias: {
                components: path.join(__dirname, '..', 'components'),
                utils: path.join(__dirname, '..', 'utils'),
                lib: path.join(__dirname, '..', 'lib'),
                comps: path.join(root, 'comps'),
                states: path.join(root, 'states')
            }
        },

        resolveLoader: {
            root: [
                path.join(__dirname, '..', 'node_modules'),
                path.join(__dirname, 'loaders')
            ]
        },

        bundleReserveList: reserveList,

        plugins: [
            new ExtractTextPlugin('app.css'),
            new webpack.DefinePlugin({
                'process.env': { 
                    NODE_ENV: JSON.stringify("development"),
                    DEBUG: JSON.stringify(process.env.DEBUG || 'true'),
                    WORKER: JSON.stringify(false)
                },
                __DEVTOOLS__: process.env.DEVTOOLS === 'true' ? true : false // eslint-disable-line
            }),
            new RepochPlugin(/[\\\/]comps$/, ".", compsDependenceMap),
            new RepochPlugin(/[\\\/]states$/, ".", statesDependenceMap),
            new webpack.optimize.OccurenceOrderPlugin(),
            new webpack.NoErrorsPlugin()
        ],

        module: {
            loaders: [
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    query: {
                        "presets": [
                            require.resolve("babel-preset-react"),
                            require.resolve("babel-preset-es2015"),
                            require.resolve("babel-preset-stage-0")
                        ],
                        "plugins": (process.env.ABTEST === 'true' ? [
                                [
                                    path.join(__dirname, "babel-plugin-try-catch-wrapper", "lib", "index.js"),
                                    {
                                        "root": [
                                            root,
                                            path.join(__dirname, '..', 'components')
                                        ],
                                        "reportError": '__report__'
                                    }
                                ]
                            ] : []).concat([
                                require.resolve("babel-plugin-transform-decorators-legacy"),
                                require.resolve("babel-plugin-add-module-exports"),
                                require.resolve("babel-plugin-transform-class-properties"),
                                [
                                    require.resolve("babel-plugin-transform-es2015-classes"),
                                    {
                                        "loose": true
                                    }
                                ]
                            ]),
                        "env": {
                            "development": {
                                "plugins": [
                                    [
                                        require.resolve("babel-plugin-react-transform"),
                                        {
                                            "transforms": [
                                                {
                                                    "transform": require.resolve("react-transform-catch-errors"),
                                                    "imports": [
                                                        require.resolve("react"),
                                                        require.resolve("redbox-react")
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                ]
                            }
                        }
                    }
                },
                {
                    test: /\.css$/,
                    exclude: /node_modules|statics/,
                    loader: ExtractTextPlugin.extract('style-loader', 
                        'css-loader?modules&importLoaders=1&' + 
                        'localIdentName=[name]__[local]___[hash:base64:5]')
                },
                {
                    test: /statics[\\\/](.+?)\.css$/,
                    loader: ExtractTextPlugin.extract('style', 'css')
                },
                {
                    test: /\.woff(2)?(\?v=\d+\.\d+\.\d+)?$/,
                    loader: "url-loader?limit=10000&" +
                        "mimetype=application/font-woff"
                },
                {
                    test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, 
                    loader: "url-loader?limit=10000&" +
                        "mimetype=application/octet-stream" 
                },
                {
                    test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, 
                    loader: "file-loader" 
                },
                {
                    test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, 
                    loader: "url-loader?limit=10000&" +
                        "mimetype=image/svg+xml" 
                },
                { 
                    test: /\.(png|jpg|jpeg|gif)$/i, 
                    loader: 'url-loader?limit=500&name=image/[hash:8].[name].[ext]' 
                },
                { 
                    test : /\.json$/,
                    loader : 'json'
                },
                {
                    test: /\.mp4$/, 
                    loader: "file-loader" 
                }
            ],
            postLoaders: config.platform === 'pc' ? [
                {
                    test: /\.js$/,
                    loaders: ['es3ify-loader'],
                }
            ] : []
        }
    }
};
