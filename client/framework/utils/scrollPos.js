export default function() {
    var doc = document.documentElement;
    var body = document.body;
    return {
        t: Math.max(window.pageYOffset || 0, doc.scrollTop, body.scrollTop),
        l: Math.max(window.pageXOffset || 0, doc.scrollLeft, body.scrollLeft)
    };
};