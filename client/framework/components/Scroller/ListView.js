'use strict';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import Scroller from './Scroller';
import styles from '../ScrollInfinite/Infinite.css';
import CSSModules from 'react-css-modules';
@CSSModules(styles)
export default class ListView extends React.Component {
	static propTypes = {
		onPullDown: PropTypes.func, // 下拉刷新回调
        onCancelPullDown: PropTypes.func, // 下拉刷新取消回调
        onPullUp: PropTypes.func, // 上拉加载回调
        children: PropTypes.node,

        setScrollCallback: PropTypes.func, // 注册scroll回调函数
        getComputedState: PropTypes.func, // 获取scroll状态
        setComputedState: PropTypes.func, // 设置scroll状态

        showPullUp: PropTypes.number, // 打开上拉开关
        compatSlider: PropTypes.bool
	}

	static defaultProps = {
		snapping: false,
		scrollingDeceleration: 0.91,
		scrollingPenetrationAcceleration: 0.08,
		penetrationDeceleration:0.68,
		animationDuration:250,
		speedMultiplier:3
	}

	static getInitialState = {
		scrollTop: 0
	}


	componentDidMount = () => {
		let wrapper = ReactDOM.findDOMNode(this).children[0];
		// let scroller = wrapper.children[0];
		// this.ww = wrapper.clientWidth;
		// this.wh = wrapper.clientHeight;
		// this.sw = scroller.offsetWidth;
		// this.sh = scroller.offsetHeight; //414 684 414 5992
		// console.log(this.ww, this.wh, this.sw, this.sh);
		this.createScroller(wrapper);
		this.updateScrollingDimensions();
		this.bindEvents();
	}

	render() {
		let { 
            styles, 
            wrapperClassName, scrollerClassName, 
            ...others 
        } = this.props;
        console.log('listView',styles);
        return (
            <div 
                className={ wrapperClassName || styles["wrapper"] } 
                {...others}
            >
                <div className={ scrollerClassName || styles["scroller"] }>
                    <div className={ styles["scroll-loader"] } ref="pullDownWrapper">
                        <em></em>
                        <span></span>
                    </div>
                    { this.props.children }
                </div>
            </div>
        );
	}



	// Events
	// ======


	// Scrolling
	// =========

	createScroller = (content) => {
		let options = {
			scrollingX: false,
			scrollingY: true,
			penetrationDeceleration: this.props.penetrationDeceleration,
			decelerationRate: this.props.scrollingDeceleration,
			penetrationAcceleration: this.props.scrollingPenetrationAcceleration,
			animationDuration:this.props.animationDuration,
			speedMultiplier:this.props.speedMultiplier
		};
		this.content = content;
		this.container = content.parentNode;
		this.options = options || {};
		// create Scroller instance
		let that = this;
		this.scroller = new Scroller(function(left, top, zoom) {
			that.renderPatch(left, top, zoom);
		}, options);

		// bind events
		this.bindEvents();

		// the content element needs a correct transform origin for zooming
		this.content.style[this.vendorPrefix + 'TransformOrigin'] = "left top";

		// reflow for the first time
		this.reflow();
	}

	updateScrollingDimensions = () => {
		let width = this.sw;
		let height = this.wh;
		let scrollWidth = this.sw;
		let scrollHeight = this.sh;
		console.log('update scrolling', width, height, scrollHeight);
		//this.scroller.setDimensions(container.clientWidth, container.clientHeight, content.offsetWidth, content.offsetHeight);

		// console.log('listView props',this.props);
		this.scroller.setDimensions(width, height, scrollWidth, scrollHeight);
	}

	getVisibleItemIndexes = () => {
		let itemIndexes = [];
		let itemHeight = this.props.itemHeightGetter();
		let itemCount = this.props.numberOfItemsGetter();
		let scrollTop = this.state.scrollTop;
		let itemScrollTop = 0;

		for (let index = 0; index < itemCount; index++) {
			itemScrollTop = (index * itemHeight) - scrollTop;

			// Item is completely off-screen bottom
			if (itemScrollTop >= this.props.style.height) {
				continue;
			}

			// Item is completely off-screen top
			if (itemScrollTop <= -this.props.style.height) {
				continue;
			}

			// Part of item is on-screen.
			itemIndexes.push(index);
		}

		return itemIndexes;
	}


	bindEvents = () => {
		let that = this;

		// reflow handling
		window.addEventListener("resize", function() {
			that.reflow();
		}, false);
		console.log('bindEvents',this.container)
		// touch devices bind touch events
		if ('ontouchstart' in window) {

			this.container.addEventListener("touchstart", function(e) {
				console.log('touchstart')

				// Don't react if initial down happens on a form element
				if (e.touches[0] && e.touches[0].target && e.touches[0].target.tagName.match(/input|textarea|select/i)) {
					return;
				}

				that.scroller.doTouchStart(e.touches, e.timeStamp);
				e.preventDefault();

			}, false);

			document.addEventListener("touchmove", function(e) {
				that.scroller.doTouchMove(e.touches, e.timeStamp, e.scale);
			}, false);

			document.addEventListener("touchend", function(e) {
				that.scroller.doTouchEnd(e.timeStamp);
			}, false);

			document.addEventListener("touchcancel", function(e) {
				that.scroller.doTouchEnd(e.timeStamp);
			}, false);

			// non-touch bind mouse events
		} else {

			let mousedown = false;

			this.container.addEventListener("mousedown", function(e) {

				if (e.target.tagName.match(/input|textarea|select/i)) {
					return;
				}

				that.scroller.doTouchStart([{
					pageX: e.pageX,
					pageY: e.pageY
				}], e.timeStamp);

				mousedown = true;
				e.preventDefault();

			}, false);

			document.addEventListener("mousemove", function(e) {

				if (!mousedown) {
					return;
				}

				that.scroller.doTouchMove([{
					pageX: e.pageX,
					pageY: e.pageY
				}], e.timeStamp);

				mousedown = true;

			}, false);

			document.addEventListener("mouseup", function(e) {

				if (!mousedown) {
					return;
				}

				that.scroller.doTouchEnd(e.timeStamp);

				mousedown = false;

			}, false);

			this.container.addEventListener("mousewheel", function(e) {
				if (that.options.zooming) {
					that.scroller.doMouseZoom(e.wheelDelta, e.timeStamp, e.pageX, e.pageY);
					e.preventDefault();
				}
			}, false);
		}

	}
	reflow = () => {
		// set the right scroller dimensions
		this.scroller.setDimensions(this.container.clientWidth, this.container.clientHeight, this.content.offsetWidth, this.content.offsetHeight);

		// refresh the position for zooming purposes
		let rect = this.container.getBoundingClientRect();
		this.scroller.setPosition(rect.left + this.container.clientLeft, rect.top + this.container.clientTop);

	}
	renderPatch = (() => {
		let docStyle = document.documentElement.style;

		let engine;
		if (window.opera && Object.prototype.toString.call(opera) === '[object Opera]') {
			engine = 'presto';
		} else if ('MozAppearance' in docStyle) {
			engine = 'gecko';
		} else if ('WebkitAppearance' in docStyle) {
			engine = 'webkit';
		} else if (typeof navigator.cpuClass === 'string') {
			engine = 'trident';
		}

		this.vendorPrefix = {
			trident: 'ms',
			gecko: 'Moz',
			webkit: 'Webkit',
			presto: 'O'
		}[engine];

		let helperElem = document.createElement("div");
		let undef;

		let perspectiveProperty = this.vendorPrefix + "Perspective";
		let transformProperty = this.vendorPrefix + "Transform";

		if (helperElem.style[perspectiveProperty] !== undef) {

			return function(left, top, zoom) {
				this.content.style[transformProperty] = 'translate3d(' + (-left) + 'px,' + (-top) + 'px,0) scale(' + zoom + ')';
			};

		} else if (helperElem.style[transformProperty] !== undef) {

			return function(left, top, zoom) {
				this.content.style[transformProperty] = 'translate(' + (-left) + 'px,' + (-top) + 'px) scale(' + zoom + ')';
			};

		} else {

			return function(left, top, zoom) {
				this.content.style.marginLeft = left ? (-left / zoom) + 'px' : '';
				this.content.style.marginTop = top ? (-top / zoom) + 'px' : '';
				this.content.style.zoom = zoom || '';
			};

		}
	})();
	updateScrollingDeceleration = () => {
			let currVelocity = this.scroller.__decelerationVelocityY;
			let currScrollTop = this.state.scrollTop;
			let targetScrollTop = 0;
			let estimatedEndScrollTop = currScrollTop;

			while (Math.abs(currVelocity).toFixed(6) > 0) {
				estimatedEndScrollTop += currVelocity;
				currVelocity *= this.props.scrollingDeceleration;
			}

			// Find the page whose estimated end scrollTop is closest to 0.
			let closestZeroDelta = Infinity;
			let pageHeight = this.props.itemHeightGetter();
			let pageCount = this.props.numberOfItemsGetter();
			let pageScrollTop;

			for (let pageIndex = 0, len = pageCount; pageIndex < len; pageIndex++) {
				pageScrollTop = (pageHeight * pageIndex) - estimatedEndScrollTop;
			if (Math.abs(pageScrollTop) < closestZeroDelta) {
				closestZeroDelta = Math.abs(pageScrollTop);
				targetScrollTop = pageHeight * pageIndex;
			}
		}
		// console.log('deceleration',targetScrollTop);
		// this.scroller.__minDecelerationScrollTop = targetScrollTop;
		//this.scroller.__maxDecelerationScrollTop = targetScrollTop;
	}

}