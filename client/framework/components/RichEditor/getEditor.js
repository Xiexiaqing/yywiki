module.exports = function() {
    return new Promise(function(resolve) {
        require.ensure([], function(require) {
            let RichEditor = require("components/RichEditor/RichEditor");
            resolve(RichEditor);
        }, 'RichEditor');
    });
};