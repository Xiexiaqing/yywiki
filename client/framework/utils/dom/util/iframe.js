import 'utils/dom/util/iconnect';
import isNode from 'utils/dom/dom/isNode';
import getSize from 'utils/dom/dom/getSize';
import position from 'utils/dom/util/position';
import pageSize from 'utils/dom/util/pageSize';

//变量定义区
var iframeConnect = {};
var FrameInner = {};
var tmpDiv = null;
var timer, timerSet;
var bodyWidth;
var bodyHeight;
var _radom = 'T' + new Date().getTime();
var _this = {
    autoHlayer: [],
    // reDefineScrollto : function(){
    //     $.core.util.scrollTo = function(el,opts){
    //         var _top = (opts && opts.top)?opts.top:0;
    //         var elTop = $.core.dom.position(el).t;
    //         _top = (elTop || 0) - _top;
    //         var _moveStop = (opts && opts.onMoveStop) || $.core.func.empty();
    //         iframeConnect.trigger &&iframeConnect.trigger('scrollTo', _top, _moveStop);
    //     };
    // },
    login: function(){
        iframeConnect.trigger('uiLogin');
    },
    scroll: function(scrollFn){
        iframeConnect.on('scroll', scrollFn);
    },
    getOuterInfo : function(){
        iframeConnect.getLayoutInfo(function(info){
            FrameInner.outInfo = info;
        });
        return true;
    },
    setIframeHeight : function(size){
        iframeConnect.setHeight(size);
    },
    setDiaAutoHeight : function(){
        FrameInner.diaAutoHeight = function(el){
            _this.autoHlayer.push(el);
            //at 绑定了 document.body 添加延时
            setTimeout(function(){
                var _pageH;
                if(isNode(el)){
                    _pageH = position(el).t + getSize(el).height;
                }else{
                    //chrome时 util.pageSize().page.hegith 不包含在iframe中
                    _pageH = pageSize().page.height;
                }
                var _addH = _pageH - getSize(document.body).height;
                if(_addH > 0){
                    if(!FrameInner.addAutoDiv){
                        FrameInner.addAutoDiv = document.createElement('div');
                        document.body.appendChild(FrameInner.addAutoDiv);
                    }
                    var _div = FrameInner.addAutoDiv;
                    var _divHeight = getSize(_div).height
                    var _h = (_div && _div.style.display != 'none')?_divHeight:0;
                    _div.style.display = '';
                    _div.style.height = (_addH + _h) + 'px';
                }
            },100);
        }
    },
    hidediaAutoHeight : function(){
        FrameInner.diaAutoHide = function(){
            /*var isShowing = false;
            console.log(_this.autoHlayer);
            $.foreach(_this.autoHlayer,function(o,i){
                if(o && (o.style.display != 'none')){
                    isShowing = true;
                }else{
                    _this.autoHlayer.splice(i,1);
                }
            });
            console.log(11, isShowing);
            if(isShowing){return;}*/
            FrameInner.addAutoDiv && (FrameInner.addAutoDiv.style.display = 'none');
        }
    },
    //获取iframe尺寸
    getIframeSize : function(){
        var _size = pageSize().page;
        var width = _size.width;
        var height = _size.height;
        var _tmpTop;
        if(tmpDiv){
            var childNodes = document.body.childNodes;
            if(childNodes[childNodes.length - 1] !== tmpDiv){
                document.body.appendChild(tmpDiv);
            }
            var rect = tmpDiv.getBoundingClientRect();
            _tmpTop = parseInt(rect.top + 10);
            if(_tmpTop !== parseInt(tmpDiv.getAttribute("_top"))){
                height = _tmpTop;
                // console.log(height, _tmpTop, width == bodyWidth && height == bodyHeight);
                tmpDiv.setAttribute("_top", height);
            }
        }
        if(width == bodyWidth && height == bodyHeight){
            return height;
        }
        bodyWidth = width;
        bodyHeight = height;
        if(!tmpDiv){
            tmpDiv = document.createElement("div");
            tmpDiv.id = "ifr_footer";
            tmpDiv.style.visibility = "hidden";
            tmpDiv.style.height = "0px";
            document.body.appendChild(tmpDiv);
            _tmpTop = tmpDiv.getBoundingClientRect().top + 10;
            tmpDiv.setAttribute("_top", _tmpTop);
            bodyHeight = _tmpTop;
        }
        return bodyHeight;
    }
};
export function setInnerIframe() {
        iframeConnect = window.iframeConnect();
        iframeConnect.login = _this.login;
        iframeConnect.scroll = _this.scroll;
        //设置iframe高度
        var iframeSize;
        clearInterval(timerSet);
        timerSet = setInterval(function(){
            iframeSize = _this.getIframeSize();
            _this.setIframeHeight(iframeSize);
        }, 500);
        //抛出自动调整高度方法
        _this.setDiaAutoHeight();
        _this.hidediaAutoHeight();
        //重新定义scrollto方法
        // _this.reDefineScrollto();
        //$.core.util.scrollTo(document.body, {top:200});
        //设置为全局
        window.FrameInner = FrameInner;
        //获取外层全局信息
        clearInterval(timer);
        timer = setInterval(_this.getOuterInfo, 500);
};
