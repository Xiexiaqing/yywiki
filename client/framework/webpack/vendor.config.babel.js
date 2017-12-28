/* eslint-env node */
var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: {
        'vendor': [
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
        filename: '[name].[chunkhash].js',
        path: path.join(__dirname, 'dist', "js"),
        library: '[name]'
    },

    plugins: [
        new webpack.DllPlugin({
            // The path to the manifest file which maps between
            // modules included in a bundle and the internal IDs
            // within that bundle
            path: path.join(__dirname, 'dist', "[name].manifest.json"),
            // The name of the global variable which the library's
            // require function has been assigned to. This must match the
            // output.library option above
            name: '[name]'
        })
    ]
}
