/**
 * remove a classname(s) for an Element
 * @name dom#removeClassName
 * @function
 * @param {Element} node
 * @param {String} className
 * @author MrGalaxyn
 */

import isWindow from "./isWindow";
import hasClass from "./hasClass";

export default function (node, className) {
    if (!node || !className || isWindow(node)) return;

    className.split(/\s+/g).forEach(function(klass) {
        if (!hasClass(node, klass)) return;

        if (node.classList) node.classList.remove(klass);
        else {
            if (node.className && node.className.baseVal !== undefined)
                node.className.baseVal = node.className.baseVal.replace(new RegExp('(?:^|\\s)' + klass + '(?:\\s|$)'), ' ');
            else
                node.className = node.className.replace(new RegExp('(?:^|\\s)' + klass + '(?:\\s|$)'), ' ');
        }
    });
};

