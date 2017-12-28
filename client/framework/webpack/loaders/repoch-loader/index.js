/*
 *  bundle-loader for repoch
 *  Author MrGalaxyn
 *
 *  MIT License http://www.opensource.org/licenses/mit-license.php
 */

var path = require("path");
var loaderUtils = require("loader-utils");

module.exports = function() {};
module.exports.pitch = function(remainingRequest) {
    this.cacheable && this.cacheable();
    var query = loaderUtils.parseQuery(this.query);
    var reserveWordList = this.options.bundleReserveList;
    if (!reserveWordList) {
        return "";
    }

    var reserve = '';
    if (reserveWordList.every(function (word) {
        var index = remainingRequest.lastIndexOf(word + '.js');
        if (index < 0) return true;
        reserve = word.split(path.sep).join('/');
        return false;
    })) {
        return '';
    }

    if(query.name) {
        var options = {
            context: query.context || this.options.context,
            regExp: query.regExp
        };
        var chunkName = loaderUtils.interpolateName(this, query.name, options);
        var chunkNameParam = ", " + JSON.stringify(chunkName);      
    } else {
        var chunkNameParam = "";
    }

    return [
        "module.exports = function(cb) {\n",
        "   require.ensure([], function(require) {\n",
        "       cb(require('", reserve, ".js'));\n",
        "   }" + chunkNameParam + ");\n",
        "}"
    ].join("");
}


