import PropTypes from 'prop-types';
/* eslint-env browser */
import React from 'react';
import ReactDOM from 'react-dom';
import { shallowEquals } from "../../utils/differ";
import { animate, transformName } from '../../utils/animation';

const CIRCULAR = 'cubic-bezier(0.1, 0.57, 0.1, 1)';
const QUADRATIC = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
const SCROLLER_CHECK_DURATION = 500;

export default () => Component => class extends React.Component {
    static propTypes = {
        startX: PropTypes.number, // 起始位置X
        startY: PropTypes.number, // 起始位置Y
        scrollX: PropTypes.bool, // X轴滑动
        bounceTime: PropTypes.number, // 回弹时间
        deceleration: PropTypes.number, // 滑动减速度
        bounceEasing: PropTypes.string, // 回弹动画
        HWCompositing: PropTypes.bool, // 硬件加速
        children: PropTypes.node,
        disableBodyMove: PropTypes.bool // 阻止body滑动
    }

    static defaultProps = {
        startX: 0, 
        startY: 0, 
        scrollX: true, 
        scrollY: true, 
        deceleration: 0.001, 
        bounceTime: 600, 
        bounceEasing: CIRCULAR,
        HWCompositing: true,
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
            wrapper, scroller
        });

        window.addEventListener('resize', this.refresh);
        this.scrollTo(this.props.startX, this.props.startY);
        this.onScrollInit && this.onScrollInit();
        this.refresh();
    }

    componentWillUnmount = () => {
        if (this.props.disableBodyMove) {
            document.body.addEventListener('touchmove', this.touchmoveCallBack);
        }
        window.removeEventListener('resize', this.refresh);
    }

    shouldComponentUpdate = (nextProps, nextState) => {
        return true;
        // if (!(this.props.children === nextProps.children || 
        //         shallowEquals(this.props.children, nextProps.children))) {
        //     this.setComputedState({ childRender: true });
        // }
        // return !(this.props === nextProps || shallowEquals(this.props, nextProps)) ||
        //  !(this.state === nextState || shallowEquals(this.state, nextState));
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
            curSlider: 0,
            disableMove: false,
            firstMove: true
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
        let wh = wrapper.clientHeight;
        let ww = wrapper.clientWidth;
        let sw = scroller.offsetWidth;
        let hasHorizontalScroll = this.props.scrollX && ww < sw;

        this.setComputedState({
            wrapperHeight: wh,
            wrapperWidth: ww,
            scrollerWidth: sw,
            hasHorizontalScroll,
            topScrollX: 0,
            bottomScrollX: ww - sw
        });

        this.onScrollRefresh && this.onScrollRefresh();
        //this.resetPosition();
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
        let { scroller, transiting, curSlider } = this.getComputedState();

        if (typeof e !== 'undefined' && e.target !== scroller) return;
        if (!transiting) return;
        if (!this.resetPosition()) {
            this.setComputedState({ transiting: false });
            this.onScrollEnd && this.onScrollEnd(curSlider);
        }
    }

    scrollTo = (x, y, time = 0, ease) => {
        let { scroller } = this.getComputedState();
        // 使用动画更新滚动位置, 并且更新当前坐标
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
        let { enable, transiting, scroller, curSlider } = this.getComputedState();
        if (!enable) return;
        // e.preventDefault();
        let point = e.touches && e.touches[0];
        if (!point) return false;

        if (transiting) {
            this.onScrollEnd && this.onScrollEnd(curSlider);
            // let { x, y } = this.getComputedPosition(scroller);
            // this.scrollTo(Math.round(x), Math.round(y));
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
        let { enable, firstMove, disableMove } = this.getComputedState();
        if (!enable) return;
        let point = e.touches && e.touches[0];
        if (!point) return false;

        let {
            x, y, pointX, pointY, distX, distY,
            hasHorizontalScroll, hasVerticalScroll,
            topScrollX, topScrollY,
            bottomScrollX, bottomScrollY,
            moved, startTime, endTime,
            checkEndTimer,
            wrapperWidth
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
        if (timestamp - startTime > 300 && Math.abs(distX) < 10 && Math.abs(distY) < 10) {
            return;
        }

        if(firstMove){
            disableMove = Math.abs(deltaX) <= Math.abs(deltaY) ?  true : false;
            this.setComputedState({
                firstMove: false,
                disableMove
            });
        }

        if(disableMove) return;
        e.preventDefault();

        let newX = x + deltaX;

        // can't move if outside of the boundaries
        if (newX >= topScrollX) {
            newX = topScrollX;
        }else if(newX <= bottomScrollX){
            newX = bottomScrollX;
        }

        if (!moved) {
            this.setComputedState({ moved: true });
            this.onScrollStart && this.onScrollStart();
        } 

        // this will change this.computedState.x
        this.scrollTo(newX, 0);

        // if (timestamp - startTime > 300) {
        //     let { x, y } = this.getComputedState();
        //     this.setComputedState({ 
        //         startTime: timestamp,
        //         startX: x,
        //         startY: y
        //     });
        //     this.onScrolling && this.onScrolling();
        // }

        // fix in webview touchend event not trigger
        // if (checkEndTimer) clearTimeout(checkEndTimer);
        // this.setComputedState({ 
        //     checkEndTimer: setTimeout(() =>
        //         this.handleTouchEnd(e), SCROLLER_CHECK_DURATION
        //     )
        // });
    }

    handleTouchEnd = e => {
        let { enable, checkEndTimer, moved, disableMove } = this.getComputedState();
        if (checkEndTimer) clearTimeout(checkEndTimer);
        if (!enable) return;
        if (disableMove) return;

        // reset if we are outside of the boundaries
        //if (this.resetPosition()) return;
        if (!moved) {
            // e.preventDefault();
            // e.stopPropagation();
            
            // this.simulateClick(e);
            return;
        }
        let endTime = Date.now();
        let {
            x, startX, startTime,
            topScrollX, bottomScrollX, 
            wrapperWidth,
            curSlider
        } = this.getComputedState();
        let duration = endTime - startTime;
        let newX = Math.round(x);

        if (newX >= topScrollX) { 
            //can't move if outside of the left boundaries
            newX = topScrollX;
            this.scrollTo(newX, 0);
        }else if(newX <= bottomScrollX){ 
            //can't move if outside of the right boundaries
            newX = bottomScrollX;
            this.scrollTo(newX, 0);
        }else{
            let destination = x;
            let direction = x - startX < 0 ? 'left' : 'right';
            let nextX = Math.floor(destination/wrapperWidth)*wrapperWidth;
            let prevX = Math.ceil(destination/wrapperWidth)*wrapperWidth;
            
            if (duration < 200) {
                // start moment touchmove
                destination = direction == 'left' ? nextX : prevX;
                duration = Math.sqrt(2*wrapperWidth*(1 - 2*this.props.deceleration)/this.props.deceleration);
            }else{
                if(direction == 'left'){
                    if(Math.abs(destination%wrapperWidth) >= wrapperWidth/2){
                        destination = nextX;
                    }else{
                        destination = prevX;
                    }
                }
                if(direction == 'right'){
                    if(Math.abs(destination%wrapperWidth) <= wrapperWidth/2){
                        destination = prevX;
                    }else{
                        destination = nextX;
                    }
                }
            }

           // console.log(destination)

            // ensures that the last position is rounded
            this.scrollTo(destination, 0, duration, 'QUADRATIC');
            newX = destination;
        }

        curSlider = Math.abs(newX/wrapperWidth);
        
        this.setComputedState({ endTime, curSlider });
        this.onScrollEnd && this.onScrollEnd(curSlider);
    }

    render() {
        return (
            <Component
                onTouchStart={ this.handleTouchStart } 
                onTouchMove={ this.handleTouchMove } 
                onTouchEnd={ this.handleTouchEnd } 
                onTouchCancel={ this.handleTouchEnd } 
                refresh={ this.refresh }
                getComputedState={ this.getComputedState }
                setComputedState={ this.setComputedState }
                setScrollCallback={ this.setScrollCallback }
                scrollTo={ this.scrollTo }
                {...this.props } />
        );
    }
};
