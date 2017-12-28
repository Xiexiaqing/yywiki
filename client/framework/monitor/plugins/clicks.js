;/**
 * collect touchstart data
 * @author xuaner
 * hots: 默认touch数据不上报
 * honey: 默认点击bee-honey元素上报
 * <a href='javascript:;' data-bee="value=reward_button_h5&ext=ext1:ext2">TestTestTestTest</a>
 */
import on from 'dom-helpers/events/on';
import queryToJson from 'utils/queryToJson';

export default class ClicksCatcher {
    constructor(sendCb, opts = {}, name) {
        this.name = name || 'clicks';
        let history = opts.history;
        let hots = opts.hots || [];

        this.inited = true;

        this.unlistenHandler = history ? history.listen(location => {
            for (var page of hots) {
                if(page === location.pathname){
                    this.ishot = true;
                    return;
                }
            }

            this.ishot = false;
        }) : () => {};

        this.getHoney = (target) => {
            if (!target || !target.hasAttribute) { return ''; }

            if(target.hasAttribute('data-bee')){
                return target.getAttribute('data-bee');
            }
            if(target.parentNode !== document.body){
                return this.getHoney(target.parentNode);
            }else{
                return '';
            }
        }

        this.isIgnore = (target) => {
            if (!target || !target.hasAttribute)  return false;

            if(target.hasAttribute('data-bee-ignore')){
                return true;
            }
            if(target.parentNode !== document.body){
                return this.isIgnore(target.parentNode);
            }else{
                return false;
            }
        }

        this.clickHandler = (evt) => {
            let target = evt.target;
            let touch = evt.touches ? evt.touches[0] : evt;
            let data = {};

            //点击上报
            let honeyStr = this.getHoney(target);
            if (honeyStr !== '') {
                data.honey = queryToJson(honeyStr).value;
            }

            //热力图数据上报
            if (this.ishot && !this.isIgnore(target)) {
                let x = Math.round(touch.pageX);
                let y = Math.round(touch.pageY);
                data.hots = x + ',' + y + ',' + document.documentElement.scrollWidth;
            }

            if (data.honey || data.hots) {
                sendCb(data);
            }
        }

        this.upload = (value) => {
            sendCb({
                honey: value
            });
        }

        let isTouch = ('ontouchstart' in window) || 
                (window.navigator.msMaxTouchPoints && window.navigator.msMaxTouchPoints > 0);
        //on(window, isTouch ? "touchstart" : "click", this.clickHandler, true);  
        on(window, 'click', this.clickHandler, true);
    }

    config(sendCb, opts) {
        if (!this.inited) {
            throw Error('plugin clicks has not init yet!');
        }
    }
}
