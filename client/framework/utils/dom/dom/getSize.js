/**
 * 获取dom的宽高
 * @id STK.core.dom.getSize
 * @params {Element} dom 被计算的dom节点
 * @return {Object} 
 *         {
 *             'width' : 0
 *             'height' : 0
 *         }
 * @author Robin Young | yonglin@staff.sina.com.cn
 * @example 
 * STK.core.dom.getSize(STK.E('layer'));
 */
import hideContainer from '../util/hideContainer';
import isNode from '../dom/isNode';

var size = function(dom){
    if(!isNode(dom)){
        throw 'core.dom.getSize need Element as first parameter';
    }
    return {
        'width' : dom.offsetWidth,
        'height' : dom.offsetHeight
    };
};
/*
    为隐藏元素
*/
var getSize = function(dom){
    var ret = null;
    if (dom.style.display === 'none') {
        dom.style.visibility = 'hidden';
        dom.style.display = '';
        ret = size(dom);
        dom.style.display = 'none';
        dom.style.visibility = 'visible';
    }else {
        ret = size(dom);
    }
    return ret;
};

export default function(dom){
    var ret = {};
    if(!dom.parentNode){
        hideContainer.appendChild(dom);
        ret = getSize(dom);
        hideContainer.removeChild(dom);
    }else{
        ret = getSize(dom);
    }
    return ret;
};
