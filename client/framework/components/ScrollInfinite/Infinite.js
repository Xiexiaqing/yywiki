import styles from './Infinite.css';
import Scroll from '../Scroll/decorator';

import PropTypes from 'prop-types';

import React from 'react';
import CSSModules from 'react-css-modules';

const LOADER_PULLED = 0;
const LOADER_LOADING = 1;
const LOADER_RESET = 2;

@Scroll()
@CSSModules(styles)
export default class ScrollInfinite extends React.Component {
    static propTypes = {
        onPullDown: PropTypes.func, // 下拉刷新回调
        onCancelPullDown: PropTypes.func, // 下拉刷新取消回调
        onPullUp: PropTypes.func, // 上拉加载回调
        children: PropTypes.node,

        setScrollCallback: PropTypes.func, // 注册scroll回调函数
        scrollTo: PropTypes.func, // 滑动位置函数
        getComputedState: PropTypes.func, // 获取scroll状态
        setComputedState: PropTypes.func, // 设置scroll状态

        showPullUp: PropTypes.number, // 打开上拉开关
        compatSlider: PropTypes.bool, // 水平垂直不可同时滑动
        pageNo: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
        initWithLoader: PropTypes.bool, // 初始状态下显示loading
    }

    static defaultProps = {
        onPullDown: function() {},
        onCancelPullDown: function() {},
        onPullUp: function() {},

        showPullUp: -1,
        compatSlider: false,
        pageNo: false,
        initWithLoader: false
    };

    constructor(props) {
        super(props);
        this.props.setScrollCallback({
            onScrollInit: this.onScrollInit,
            onScrollRefresh: this.onScrollRefresh,
            onScrolling: this.onScrolling,
            onScrollEnd: this.onScrollEnd
        });
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (prevProps.showPullUp !== this.props.showPullUp || prevState.showPullUp !== this.state.showPullUp) {
            this.props.refresh()
        }
    }

    state = {
        pullClass: 'scroll-pull-down',
        pullText: '下拉刷新',
        showPullUp: false
    }

    setLoaderState = state => {
        switch (state) {
            case LOADER_PULLED: // pulled state
                this.props.setComputedState({ pullDown: true });
                this.setState({
                    pullClass: 'scroll-pull-down',
                    pullText: '释放更新'
                });
                break;
            case LOADER_LOADING: // loading state
                this.props.setComputedState({ pullDown: true });
                this.setState({
                    pullClass: 'scroll-pull-loading',
                    pullText: '加载中...'
                });
                break;
            case LOADER_RESET: // reset state
                this.props.setComputedState({ pullDown: false });
                this.setState({
                    pullClass: 'scroll-pull-up',
                    pullText: '下拉刷新'
                });
                break;
        }
    }

    onScrollInit = () => {
        let { scrollX, scrollY } = this.props.getComputedState();
        let rect = this.refs.pullDownWrapper.getBoundingClientRect();
        var w = Math.round(rect.width);
        var h = Math.round(rect.height);
        this.props.setComputedState({ 
            offset: scrollX ? w : h,
            loadingWrapperSize: {w, h}
        });
        if (!this.props.initWithLoader) { 
            if (scrollX)
                this.props.scrollTo(-w, 0);
            if (scrollY)
                this.props.scrollTo(0, -h);
        }
    };

    onScrollRefresh = () => {
        let {
            scrollX, scrollY, offset,
            wrapperWidth, wrapperHeight,
            scrollerWidth, scrollerHeight,
            loadingWrapperSize
        } = this.props.getComputedState();
        // only when the content is larger than one screen, then we can scroll
        let hasHorizontalScroll = scrollX && wrapperWidth < 
                scrollerWidth - loadingWrapperSize.w * 2;
        let hasVerticalScroll = scrollY && wrapperHeight < 
                scrollerHeight - loadingWrapperSize.h * 2;
        this.props.setComputedState({ pullUp: false });
        if (hasVerticalScroll) {
            this.props.setComputedState({ 
                hasHorizontalScroll, hasVerticalScroll,
                topScrollY: 0 - offset,
                bottomScrollY: wrapperHeight - scrollerHeight
            });
        }
        if (hasHorizontalScroll) {
            this.props.setComputedState({ 
                hasHorizontalScroll, hasVerticalScroll,
                topScrollX: 0 - offset,
                bottomScrollX: wrapperWidth - scrollerWidth
            });
        }

        if (!hasHorizontalScroll && !hasVerticalScroll && this.props.showPullUp != 1) {
            this.setState({ showPullUp: false });
            if (scrollX) {
                var bottomScrollX = wrapperWidth - scrollerWidth > 0 ? 
                        (0 - offset) : (wrapperWidth - scrollerWidth);
                bottomScrollX = bottomScrollX > - offset ? -offset: bottomScrollX;

                this.props.setComputedState({ 
                    bottomScrollX,
                    topScrollX: 0 - offset,
                    hasHorizontalScroll: true
                });
            }
            if (scrollY) {
                var bottomScrollY = wrapperHeight - scrollerHeight > 0 ? 
                        (0 - offset) : (wrapperHeight - scrollerHeight);
                bottomScrollY = bottomScrollY > - offset ? -offset: bottomScrollY;
                this.props.setComputedState({ 
                    bottomScrollY,
                    topScrollY: 0 - offset,
                    hasVerticalScroll: true
                });
            }
        } else {
            this.setState({ showPullUp: true });
        }

        this.props.setComputedState({ 
            hasHorizontalScroll: false,
            scrollX:false,
            compatSlider: this.props.compatSlider
        });

        this.setLoaderState(LOADER_RESET);
    };

    // we have to change scroll internal status here
    onScrolling = () => {
        let { 
            pullDown, offset, hasVerticalScroll, 
            x, y, topScrollX, topScrollY 
        } = this.props.getComputedState();
        let compareAxis = hasVerticalScroll ? y : x;
        // User needs to pull down past the top edge of the pulldown element.
        // To prevent false triggers from aggressive scrolling, they should
        // have to pull down some additional amount. Half the height of the
        // pulldown seems reasonable, but adjust per preference. Set "pullDown"
        // state if not pullDown and user has pullDown past the pulldown 
        // element by pullDownPast pixels
        if (!pullDown && compareAxis > offset / 2) {
            this.setLoaderState(LOADER_PULLED);
            // Circumvent top offset so pull-down element doesn't rubber-band
            if (hasVerticalScroll) {
                this.props.setComputedState({ 
                    topScrollY: topScrollY + offset 
                });
            } else {
                this.props.setComputedState({ 
                    topScrollY: topScrollX + offset 
                });
            }
        } else if (pullDown && compareAxis <= 0) {
            // Allow user to "oopsie", and scroll back to cancel and avoid 
            // pull-down action Cancel if pullDown and user has scrolled back
            // to top of pulldown element
            this.props.onCancelPullDown();
            this.setLoaderState(LOADER_RESET);
            // Re-instate top offset
            if (hasVerticalScroll) {
                this.props.setComputedState({ 
                    topScrollY: topScrollY - offset 
                });
            } else {
                this.props.setComputedState({ 
                    topScrollY: topScrollX - offset 
                });
            }
        }
    };

    onScrollEnd = () => {
        let { 
            pullDown, pullUp, hasVerticalScroll, hasHorizontalScroll,
            bottomScrollX, bottomScrollY, x, y
        } = this.props.getComputedState();
        if (pullDown) {
            this.props.onPullDown();
            this.setLoaderState(LOADER_LOADING);
        }

        if (!this.refs.pullDownWrapper) {
            return;
        }

        let { 
            width, height 
        } = this.refs.pullDownWrapper.getBoundingClientRect();

        if (this.state.showPullUp && this.props.showPullUp > 0 && !pullUp) {
            if ((hasVerticalScroll && y <= bottomScrollY + height) ||
                    (hasHorizontalScroll && x <= bottomScrollX + width)) {
                this.props.onPullUp();
                this.props.setComputedState({ pullUp: true });
            }
        }
    };

    getPullUploader = () => {
        if (this.props.showPullUp === -1) return null;

        if (this.props.showPullUp > 0) {
            return (
                <div className={ styles["scroll-loader"] }>
                    <em className={ styles["scroll-pull-loading"] }></em>
                    <span>加载中...</span>
                </div>
            )
        }

        return this.props.showPullUp < 0 ? null :
            (<p className={ styles['non_cont'] }>没有更多内容了</p>);
    }

    render() {
        let { 
            styles, 
            wrapperClassName, scrollerClassName, 
            ...others 
        } = this.props;

        return (
            <div 
                className={ wrapperClassName || styles["wrapper"] } 
                {...others}
            >
                <div className={ scrollerClassName || styles["scroller"] }>
                    <div className={ styles["scroll-loader"] } ref="pullDownWrapper">
                        <em className={ styles[this.state.pullClass] }></em>
                        <span>{ this.state.pullText }</span>
                    </div>
                    { this.props.children }
                    { this.getPullUploader() }
                </div>
            </div>
        );
    }
}

