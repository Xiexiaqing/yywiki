/* eslint-env node */
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const RepochPlugin = require("./plugins/repoch-webpack-plugin");
const OfflinePlugin = require('offline-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const _ = require('lodash');

var root = process.env.CODE_ROOT || process.cwd();
var suffix, prefix;
var dirLists = root.split(path.sep);
suffix = dirLists.pop() || dirLists.pop();
if (suffix === '_repochpack') {
    suffix = dirLists.pop();
}

const config = require(path.join(root, 'config', 'project'));
prefix = config.prefix.indexOf('//') === 0 ? config.prefix : config.prefix.indexOf('http') === 0 ? config.prefix : ('//' + config.prefix);
// prefix = prefix.substr(-1) === '/' ? prefix + suffix + '/' : '/' + prefix + suffix + '/';

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
    })
}

const routeConf = require(path.join(root, 'routes', 'config'))
var reserveList = [];
var compsDependenceMap = {};
var statesDependenceMap = {};
Object.keys(routeConf.route).map(function(routePath) {
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
});

checkConfigFile(root);

const cfg = {
    devtool: 'hidden-source-map',
    target: 'web',
    context: path.join(__dirname, '..'),
    entry: {
        app: 'lib/index',
        bee: 'monitor/bee',
        vendor: [
            "utils/axios",
            "babel-polyfill",
            "exenv", 
            "history", 
            "react", 
            "react-dom", 
            "react-redux", 
            "react-router",
            "redux", 
            "redux-thunk"
        ]
    },

    output: {
        path: path.join(root, 'dist'),
        publicPath: prefix,
        filename: 'js/[name].[chunkhash].js',
        chunkFilename: "js/[name].[chunkhash].js"
    },

    // Worker不支持跨域，目前的模式无法线上使用
    // worker: {
    //     output: {
    //         filename: "js/worker.[hash].js",
    //         chunkFilename: "js/[name].[hash].worker.js"
    //     }
    // },

    resolve: {
        root: [
            root, path.join(__dirname, '..'),
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
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production'),
                DEBUG: JSON.stringify(process.env.DEBUG || 'true'),
                WORKER: JSON.stringify(false)
            },
            __DEVTOOLS__: false
        }),
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                warnings: false
            }
        }),
        new RepochPlugin(/[\\\/]comps$/, ".", compsDependenceMap),
        new RepochPlugin(/[\\\/]states$/, ".", statesDependenceMap),
        new ExtractTextPlugin('css/[name].[contenthash].css'),
        new webpack.NamedModulesPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            names: ["vendor", "inline"],
            minChunks: Infinity
        }),
        new HtmlWebpackPlugin({
            excludeChunks: ['inline'],
            templateContent: function(templateParams, compilation) {
                var template = _.template(config.tpl);
                function getGeneratedFilenameForChunk(stats, chunkName) {
                    return stats.toJson().assetsByChunkName[chunkName][0];
                }
                var allAssets = templateParams.webpack.assets;
                var assetsObj = {
                    app: '',
                    bee: '',
                    css:'',
                    vendor: ''
                };
                var index = 0;
                for (var i = 0; i < allAssets.length; i++) {
                    if (/\.map$/.test(allAssets[i].name)) {
                        continue;
                    }
                    if (allAssets[i].name.indexOf('vendor') > -1) {
                        assetsObj.vendor = allAssets[i].name;
                        index++;
                    } else if (allAssets[i].name.indexOf('js/app') > -1) {
                        assetsObj.app = allAssets[i].name;
                        index++;
                    } else if (allAssets[i].name.indexOf('js/bee') > -1) {
                        assetsObj.bee = compilation.assets[allAssets[i].name].source().split(/\s\/\/#\s/)[0];
                        index++;
                    } else if (allAssets[i].name.indexOf('css/app') > -1) {
                        assetsObj.css = allAssets[i].name;
                        index++;
                    }

                    if (index == 4) break;
                }

                var stats = compilation.getStats();

                var inlineFilename = getGeneratedFilenameForChunk(stats, 'inline');
                var inlineSource = compilation.assets[inlineFilename].source().split(/\s\/\/#\s/)[0];

                return template({ 
                    js: {
                        bee: assetsObj.bee,
                        vendor: prefix + assetsObj.vendor,
                        app: prefix + assetsObj.app,
                        inlineSource: inlineSource
                    },
                    title: config.title,
                    css: prefix + assetsObj.css,
                    html: config.html,
                    manifest: false
                });
            },
            filename: 'index.html',
            hash: true
        }),
        new CopyWebpackPlugin([
            {
                from: path.join(root, 'statics/manifest.json'),
                to: path.join(root, 'dist/manifest.json')
            },
            {
                from: path.join(root, 'statics/images/logo'),
                to: path.join(root, 'dist/image/logo')
            },
            {
                from: path.join(root, 'statics/js/offlinepage.js'),
                to: path.join(root, 'dist/offlinepage.js')
            }
        ]),
        new OfflinePlugin()
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
                                    path.join(__dirname, "plugins", "babel-plugin-try-catch-wrapper", "lib", "index.js"),
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
                loader: 'url-loader?limit=1&name=image/[hash:8].[name].[ext]' 
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
};

module.exports = cfg;
