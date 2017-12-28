var generalPosition = function(el){
    var box, scroll, body, docElem, clientTop, clientLeft;
    box = el.getBoundingClientRect();
    var dd = document.documentElement;
    var db = document.body;
    scroll = {
        top: Math.max(window.pageYOffset || 0, dd.scrollTop, db.scrollTop),
        left: Math.max(window.pageXOffset || 0, dd.scrollLeft, db.scrollLeft)
    };
    body = el.ownerDocument.body;
    docElem = el.ownerDocument.documentElement;
    clientTop = docElem.clientTop || body.clientTop || 0;
    clientLeft = docElem.clientLeft || body.clientLeft || 0;
    return {
        l: parseInt(box.left + scroll['left']- clientLeft, 10) || 0,
        t: parseInt(box.top + scroll['top'] - clientTop, 10) || 0
    };
};

var countPosition = function(el, shell){
    var pos,parent;
    pos = [el.offsetLeft, el.offsetTop];
    parent = el.offsetParent;
    if (parent !== el && parent !== shell) {
        while (parent) {
            pos[0] += parent.offsetLeft;
            pos[1] += parent.offsetTop;
            parent = parent.offsetParent;
        }
    }
    
    if (el.parentNode) {
        parent = el.parentNode;
    }
    else {
        parent = null;
    }
    while (parent && !/^body|html$/i.test(parent.tagName) && parent !== shell) { // account for any scrolled ancestors
        if (parent.style.display.search(/^inline|table-row.*$/i)) {
            pos[0] -= parent.scrollLeft;
            pos[1] -= parent.scrollTop;
        }
        parent = parent.parentNode;
    }
    return {
        l: parseInt(pos[0], 10),
        t: parseInt(pos[1], 10)
    };
};

export default function(oElement, conf = {}) {
    if (oElement == document.body) {
        return false;
    }
    if (oElement.parentNode == null) {
        return false;
    }
    if (oElement.style.display == 'none') {
        return false;
    }

    if (oElement.getBoundingClientRect) {// IE6+  FF3+ chrome9+ safari5+ opera11+
        if (conf.parent) {
            var o = generalPosition(oElement);
            var p = generalPosition(conf.parent);
            return {
                'l' : o.l - p.l,
                't' : o.t - p.t
            };
        } else {
            return generalPosition(oElement);
        }
    } else { //old browser
        return countPosition(oElement, conf.parent || document.body);
    }
};

