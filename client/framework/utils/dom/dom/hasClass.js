/**
 * to decide whether Element A has an classname B
 * @name dom#hasClassName
 * @function
 * @param {Element} node
 * @param {String} className
 * @return {Boolean}
 * @author MrGalaxyn
 */
import isWindow from "./isWindow";

export default function (node, className) {
    if (!node || !className || isWindow(node)) return;
    var klass = node.className || '',
        svg = klass && klass.baseVal !== undefined;

    return node.classList ? node.classList.contains(className) :
        (new RegExp('(^|\\s)' + className + '($|\\s)').test(svg ? klass.baseVal : klass));
}

