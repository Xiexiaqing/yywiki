/**
 * 判断元素是否是window
 */

export default function isWindow(obj) {
    return obj != null && obj == obj.window;
};