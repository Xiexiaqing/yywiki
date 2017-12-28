/*
 *  bundle-loader for repoch
 *  Author MrGalaxyn
 *
 *  MIT License http://www.opensource.org/licenses/mit-license.php
 */

var path = require("path");
var ContextElementDependency = require("webpack/lib/dependencies/ContextElementDependency");

function ContextReplacementPlugin(resourceRegExp, newContentResource, newContentCreateContextMap) {
    this.resourceRegExp = resourceRegExp;
    this.newContentResource = newContentResource;

    if (typeof newContentCreateContextMap === "object") {
        this.newContentCreateContextMap = function(fs, callback) {
            callback(null, newContentCreateContextMap)
        };
    } else if (typeof newContentCreateContextMap === "function") {
        this.newContentCreateContextMap = newContentCreateContextMap;
    }
}
module.exports = ContextReplacementPlugin;
ContextReplacementPlugin.prototype.apply = function(compiler) {
    var resourceRegExp = this.resourceRegExp;
    var newContentResource = this.newContentResource;
    var newContentCreateContextMap = this.newContentCreateContextMap;
    compiler.plugin("context-module-factory", function(cmf) {
        cmf.plugin("after-resolve", function(result, callback) {
            if (!result) return callback();
            if (!/repoch\-loader/.test(result.loaders)) return callback(null, result);

            if (resourceRegExp.test(result.resource)) {
                if (typeof newContentResource !== "undefined")
                    result.resource = path.resolve(result.resource, newContentResource);
                if (typeof newContentCreateContextMap === "function")
                    result.resolveDependencies = createResolveDependenciesFromContextMap(newContentCreateContextMap);
            }
            return callback(null, result);
        });
    });
};

function createResolveDependenciesFromContextMap(createContextMap) {
    return function resolveDependenciesFromContextMap(fs, resource, recursive, regExp, callback) {
        createContextMap(fs, function(err, map) {
            if (err) return callback(err);
            var dependencies = Object.keys(map).map(function(key) {
                return new ContextElementDependency(map[key], key);
            });
            callback(null, dependencies);
        });
    }
};
