var hasOwn = Object.prototype.hasOwnProperty;
export default function shallowEquals(a, b) {
    // primitives (usually undefined)
    if (a === b) {
        return true;
    }

    var aKeys = Object.keys(a);
    var bKeys = Object.keys(b);

    // prevents us from having to look at each key in b
    if (aKeys.length !== bKeys.length) {
        return false;
    }

    return aKeys.every(function(key){
        return hasOwn.call(b, key) && a[key] === b[key];

    });
}
