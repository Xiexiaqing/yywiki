import PropTypes from 'prop-types';
/* eslint-env browser */
import React from 'react';
import ReactDOM from 'react-dom';
import { animate, transformName } from '../../utils/animation';

const CIRCULAR = 'cubic-bezier(0.1, 0.57, 0.1, 1)';
const QUADRATIC = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
const test = 'cubic-bezier(0.33,0.66,0.66,1)';
const SCROLLER_CHECK_DURATION = 500;

export default () => Component => class extends React.Component {
    static propTypes = {
        startX: PropTypes.number, // 起始位置X
        startY: PropTypes.number, // 起始位置Y
        scrollX: PropTypes.bool, // X轴滑动
        scrollY: PropTypes.bool, // Y轴滑动
        hasBounce: PropTypes.bool, // 是否有回弹
        bounceTime: PropTypes.number, // 回弹时间
        deceleration: PropTypes.number, // 滑动减速度
        bounceEasing: PropTypes.string, // 回弹动画
        HWCompositing: PropTypes.bool, // 硬件加速
        useTransition: PropTypes.bool, // 硬件加速
        compatSlider: PropTypes.bool, // 水平垂直不可同时滑动
        children: PropTypes.node,
        scrollTopY: PropTypes.bool, // 滑到垂直顶
        scrollToY: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]), //滚动到固定位置Y
        pageNo: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
        disableBodyMove: PropTypes.bool // 阻止body滑动
    }

    static defaultProps = {
        startX: 0, 
        startY: 0, 
        scrollX: false, 
        scrollY: true, 
        hasBounce: true,
        deceleration: 0.006, 
        bounceTime: 600, 
        bounceEasing: CIRCULAR,
        HWCompositing: true,
        useTransition: true,
        compatSlider: false,
        scrollTopY: false,
        scrollToY: false,
        pageNo: false,
        disableBodyMove: true
    };

    touchmoveCallBack = (e) => {
        e.preventDefault();
    }

    componentDidMount = () => {
        if (this.props.disableBodyMove) {
            document.body.addEventListener('touchmove', this.touchmoveCallBack);
        }

        let wrapper = ReactDOM.findDOMNode(this);
        let scroller = wrapper.children[0];
        
        this.setComputedState({
            startX: this.props.startX,
            startY: this.props.startY,
            scrollX: this.props.scrollX,
            scrollY: this.props.scrollY,
            hasBounce: this.props.hasBounce,
            wrapper, scroller
        });

        window.addEventListener('resize', this.refresh);
        this.scrollTo(this.props.startX, this.props.startY);
        this.onScrollInit && this.onScrollInit();
        this.refresh();
    }

    componentWillUnmount = () => {
        if (this.props.disableBodyMove) {
            document.body.removeEventListener('touchmove', this.touchmoveCallBack);
        }
        window.removeEventListener('resize', this.refresh);
    }

    shouldComponentUpdate = (nextProps, nextState) => {
        let { compatSlider, topScrollY } = this.getComputedState();

        if(nextProps.scrollTopY){
            this.scrollTo(0, topScrollY);
            //return false;
        }

        if(nextProps.scrollToY){
            this.scrollTo(0, nextProps.scrollToY);
            //return false;
        }

        if(nextProps.compatSlider != compatSlider){
            this.setComputedState({
                compatSlider: nextProps.compatSlider
            });
            return false;
        }
        this.setComputedState({ childRender: true });
        return true;
    }

    componentDidUpdate = () => {
        let { childRender } = this.getComputedState();
        if (childRender) {
            this.refresh();
            this.setComputedState({ childRender: false });
        }
    }

    getComputedState = () => {
        this.computedState = this.computedState || {
            x: 0,
            y: 0,
            distX: 0,
            distY: 0,
            scrollX: false, 
            scrollY: true,
            pointX: 0,
            pointY: 0,
            topScrollX: 0,
            bottomScrollX: 0,
            topScrollY: 0,
            bottomScrollY: 0,
            startTime: 0, // scroll start time
            endTime: 0, // scroll end time
            hasHorizontalScroll: false, // is horizontal scroll
            hasVerticalScroll: false, // is vertical scroll
            moved: false,
            transiting: false,
            checkEndTimer: false,
            enable: true,
            hasBounce: true,
            disableMove: false,
            firstMove: true,
            compatSlider: false,
        };
        return this.computedState;
    }

    setComputedState = (obj) => {
        Object.assign(this.getComputedState(), obj);
    };

    setScrollCallback = obj => {
        [
            "onScrollInit", "onScrollRefresh", 
            "beforeScrollStart", "onScrollStart", "onScrolling",
            "onScrollEnd", "setResetPosition"
        ].forEach(method => {
            if (obj[method]) {
                this[method] = obj[method];
            }
        });
    }

    momentum = (
        current, 
        start, 
        time, 
        maxDistUpper, 
        maxDistLower, 
        wrapperSize, 
        deceleration,
        hasBounce
    ) => {
        let dist = current - start;
        let speed = Math.abs(dist) / time;
        let newDist = (speed * speed) / (2 * deceleration);
        let duration = speed / deceleration;
        let outsideDist = 0;
        let newTime = 0;

        if (dist > 0 && newDist > maxDistUpper) {
            if(hasBounce){
                outsideDist = wrapperSize / (6 / (newDist / speed * deceleration));
            } 
            maxDistUpper = maxDistUpper + outsideDist;
            speed = speed * maxDistUpper / newDist;
            newDist = maxDistUpper;
        } else if (dist < 0 && newDist > maxDistLower ) { //pull up

            if(hasBounce){
                outsideDist = wrapperSize / (6 / (newDist / speed * deceleration));
            } 

            maxDistLower = maxDistLower + outsideDist;
            speed = speed * maxDistLower / newDist;
            newDist = maxDistLower;
        }

        newDist = newDist * (dist < 0 ? -1 : 1);
        newTime = speed / deceleration;

        return {
            dist: newDist,
            time: Math.round(newTime)
        };
    }

    simulateClick = e => {
        let target = e.target;

        if (!(/(SELECT|INPUT|TEXTAREA)/i).test(target.tagName)) {
            let ev = document.createEvent('MouseEvents');
            ev.initMouseEvent('click', true, true, e.view, 1,
                target.screenX, target.screenY, target.clientX, target.clientY,
                e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
                0, null);

            ev._constructed = true;
            target.dispatchEvent(ev);
        }
    }

    refresh = () => {
        let { wrapper, scroller } = this.getComputedState();
        let ww = wrapper.clientWidth;
        let wh = wrapper.clientHeight;
        let sw = scroller.offsetWidth;
        let sh = scroller.offsetHeight;
        let hasHorizontalScroll = this.props.scrollX && ww < sw;
        let hasVerticalScroll = this.props.scrollY && wh < sh;
        if (!hasHorizontalScroll) {
            this.setComputedState({
                wrapperWidth: ww,
                wrapperHeight: wh,
                scrollerWidth: sw,
                scrollerHeight: sh,
                hasHorizontalScroll,
                hasVerticalScroll,
                topScrollX: 0,
                bottomScrollX: 0,
                topScrollY: 0,
                bottomScrollY: wh - sh
            });
        }
        if (!hasVerticalScroll) {
            this.setComputedState({
                wrapperWidth: ww,
                wrapperHeight: wh,
                scrollerWidth: sw,
                scrollerHeight: sh,
                hasHorizontalScroll,
                hasVerticalScroll,
                topScrollX: 0,
                bottomScrollX: ww - sw,
                topScrollY: 0,
                bottomScrollY: 0
            });
        }
        this.onScrollRefresh && this.onScrollRefresh();
        this.resetPosition();
    }

    getComputedPosition = el => {
        var matrix = window.getComputedStyle(el);
        // use CSS3 transform Matrix to calculate position
        matrix = matrix[transformName].split(')')[0].split(', ');

        return {
            x: Math.round(matrix[12] || matrix[4]),
            y: Math.round(matrix[13] || matrix[5])
        };
    }

    resetPosition = (time = this.props.bounceTime) => {
        // if there's a customize method, then do it
        if (this.setResetPosition) {
            return this.setResetPosition(time, this.props.bounceEasing);
        }
        let { 
            x, y, 
            hasHorizontalScroll, topScrollX,
            hasVerticalScroll, topScrollY,
            bottomScrollX, bottomScrollY
        } = this.getComputedState();
        let oldX = x;
        let oldY = y;

        // if we are out of bound, reset position
        if (!hasHorizontalScroll || x > topScrollX) {
            x = topScrollX;
        } else if (x < bottomScrollX) {
            x = bottomScrollX;
        }
        if (!hasVerticalScroll || y > topScrollY) {
            y = topScrollY;
        } else if (y < bottomScrollY) {
            y = bottomScrollY;
        }

        if (x === oldX && y === oldY) {
            return false;
        }
        this.scrollTo(x, y, time, this.props.bounceEasing);
        return true;
    }

    transitionEnd = e => {
        let { scroller, transiting } = this.getComputedState();
        if (typeof e !== 'undefined' && e.target !== scroller) return;
        if (!transiting) return;
        if (!this.resetPosition()) {
            this.setComputedState({ transiting: false });
            this.onScrollEnd && this.onScrollEnd();
        }
    }

    scrollTo = (x, y, time = 0, ease) => {
        let { scroller } = this.getComputedState();
        //使用动画更新滚动位置, 并且更新当前坐标
        animate(scroller, {
            translateX: x + 'px',
            translateY: y + 'px',
            HWCompositing: this.props.HWCompositing,
            duration: time,
            ease: ease,
            onComplete: this.transitionEnd
        });

        this.setComputedState({
            transiting: time > 0,
            x, y
        });
    }

    handleTouchStart = e => {
        let { enable, transiting, scroller } = this.getComputedState();
        if (!enable) return;
        e.preventDefault();
        let point = e.touches && e.touches[0];
        if (!point) return false;

        if (transiting) {
            this.onScrollEnd && this.onScrollEnd();
            let { x, y } = this.getComputedPosition(scroller);
            this.scrollTo(Math.round(x), Math.round(y));
        }
        let { x, y } = this.getComputedState();
        this.setComputedState({
            startX: x,
            startY: y,
            pointX: point.pageX,
            pointY: point.pageY,
            moved: false,
            distX: 0,
            distY: 0,
            startTime: Date.now(),
            disableMove: false,
            firstMove:true
        });

        this.beforeScrollStart && this.beforeScrollStart();
    }

    handleTouchMove = e => {
        let { enable } = this.getComputedState();
        if (!enable) return;
        e.preventDefault();
        let point = e.touches && e.touches[0];
        if (!point) return false;

        let {
            x, y, pointX, pointY, distX, distY,
            hasHorizontalScroll, hasVerticalScroll,
            topScrollX, topScrollY,
            bottomScrollX, bottomScrollY,
            moved, startTime, endTime,
            checkEndTimer, hasBounce, disableMove, compatSlider, firstMove
        } = this.getComputedState();

        let deltaX = point.pageX - pointX;
        let deltaY = point.pageY - pointY;
        let timestamp = Date.now();

        this.setComputedState({
            pointX: point.pageX,
            pointY: point.pageY,
            distX: distX + deltaX,
            distY: distY + deltaY
        });

        // We need to move at least 10 pixels for the scrolling to initiate
        if (timestamp - startTime > 300 && 
                (Math.abs(distX) < 10 && Math.abs(distY) < 10)) {
            return;
        }

        if(compatSlider && firstMove){
            disableMove = Math.abs(deltaX) > Math.abs(deltaY) ?  true : false;
            this.setComputedState({
                firstMove: false,
                disableMove
            });
        }
        if(disableMove) return;

        deltaX = hasHorizontalScroll ? deltaX : 0;
        deltaY = hasVerticalScroll ? deltaY : 0;

        let newX = x + deltaX;
        let newY = y + deltaY;

        // Slow down if outside of the boundaries
        if(hasBounce){
            if (newX > topScrollX || newX < bottomScrollX) {
                newX = Math.round(x + deltaX / 3);
            }
            if (newY > topScrollY || newY < bottomScrollY) {
                newY = Math.round(y + deltaY / 3);
            } 
        }else{
            if (newX > topScrollX || newX < bottomScrollX) {
                newX = Math.round(x);
            }
            if (newY > topScrollY || newY < bottomScrollY) {
                newY = Math.round(y);
            } 
        }

        if (!moved) {
            this.setComputedState({ moved: true });
            this.onScrollStart && this.onScrollStart();
        } 

        // this will change this.computedState.x and this.computedState.y
        this.scrollTo(newX, newY);

        // if (timestamp - startTime > 300) {
        //     let { x, y } = this.getComputedState();
        //     this.setComputedState({ 
        //         startTime: timestamp,
        //         startX: x,
        //         startY: y
        //     });
        this.onScrolling && this.onScrolling();
        // }

        // fix in webview touchend event not trigger
        if (checkEndTimer) clearTimeout(checkEndTimer);
        let evt = Object.assign({}, e);
        this.setComputedState({ 
            checkEndTimer: setTimeout(
                () => this.handleTouchEnd(evt), 
                SCROLLER_CHECK_DURATION
            )
        });
    }

    handleTouchEnd = e => {
        let { enable, checkEndTimer, moved, disableMove } = this.getComputedState();
        if (checkEndTimer) clearTimeout(checkEndTimer);
        if (!enable) return;
        if (disableMove) return;

        // reset if we are outside of the boundaries
        if (this.resetPosition()) return;
        
        let endTime = Date.now();
        let {
            x, y, startX, startY, startTime,
            topScrollX, topScrollY,
            bottomScrollX, bottomScrollY, 
            wrapperWidth, wrapperHeight, 
            scrollerWidth, scrollerHeight,
            hasHorizontalScroll, hasVerticalScroll,
            hasBounce
        } = this.getComputedState();
        let duration = endTime - startTime;
        let newX = x;
        let newY = y;
        let momentumX = { dist:0, time:0 };
        let momentumY = { dist:0, time:0 };
        let distanceX = Math.abs(newX - startX);
        let distanceY = Math.abs(newY - startY);
        let newDuration;

        if (duration < 100 && (!moved || distanceX < 4 && distanceY < 4)) {
            e.preventDefault();
            e.stopPropagation();

            this.simulateClick(e);
            return;
        }

        // start momentum animation
        if (duration < 300) {
            momentumX = hasHorizontalScroll ? this.momentum(x, startX, 
                    duration, topScrollX - x, wrapperWidth - bottomScrollX + x, wrapperWidth, 
                    this.props.deceleration, hasBounce) : 
                    { dist: newX, time: 0 };
            momentumY = hasVerticalScroll ? this.momentum(y, startY, 
                    duration, topScrollY - y, wrapperHeight - bottomScrollY + y, wrapperHeight, 
                    this.props.deceleration, hasBounce) : 
                    { dist: newY, time: 0 };

            newX = x + momentumX.dist;
            newY = y + momentumY.dist;
        }

        if (momentumX.dist || momentumY.dist) {
            newDuration = Math.max(Math.max(momentumX.time, momentumY.time), 10);

            this.scrollTo(Math.round(newX), Math.round(newY), newDuration, test);
            this.onScrollEnd && this.onScrollEnd();

            return;
        }

        this.scrollTo(Math.round(newX), Math.round(newY), newDuration);
        this.onScrollEnd && this.onScrollEnd();
        return;
    }

    handleClick = e => {
        if (!e._constructed) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    render() {
        return (
            <Component
                onTouchStart={ this.handleTouchStart } 
                onTouchMove={ this.handleTouchMove } 
                onTouchEnd={ this.handleTouchEnd } 
                onTouchCancel={ this.handleTouchEnd } 
                onClick={ this.handleClick }
                refresh={ this.refresh }
                getComputedState={ this.getComputedState }
                setComputedState={ this.setComputedState }
                setScrollCallback={ this.setScrollCallback }
                scrollTo={ this.scrollTo }
                {...this.props } />
        );
    }
};
