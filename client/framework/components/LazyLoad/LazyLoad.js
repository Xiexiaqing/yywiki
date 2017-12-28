import PropTypes from 'prop-types';
import React from 'react';
import CSSModules from 'react-css-modules';
import buildPicURL from './utils/buildWeiboImageURL';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import parentScroll from './utils/parentScroll';
import { findDOMNode } from 'react-dom';
import inViewport from './utils/inViewport';
// import { add, remove } from 'eventlistener';
import ReactDOM from 'react-dom';
import styles from './LazyLoad.css';
function noop() {}

@CSSModules(styles, { allowMultiple: true })
export default class LazyLoad extends React.Component {
    static propTypes = {
        pid: PropTypes.string,
        imgW: PropTypes.number,
        imgH: PropTypes.number,
        needBlur: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.bool
        ]),
        imgQual: PropTypes.string,

        offset: PropTypes.number,
        offsetBottom: PropTypes.number,
        offsetHorizontal: PropTypes.number,
        offsetLeft: PropTypes.number,
        offsetRight: PropTypes.number,
        offsetTop: PropTypes.number,
        offsetVertical: PropTypes.number,
        threshold: PropTypes.number,
        throttle: PropTypes.number,
        width: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]),
        onContentVisible: PropTypes.func

    }

    static defaultProps = {
        // params of image
        pid: 'c43d4309jw1f3bcj9pezyj20hs08wtbs',
        imgW: 640,
        imgH: 320,
        needBlur: '',
        imgQual: 'large',
        
        // params of lazy load
        debounce: true,
        offset: 0,
        offsetBottom: 0,
        offsetHorizontal: 0,
        offsetLeft: 0,
        offsetRight: 0,
        offsetTop: 0,
        offsetVertical: 0,
        throttle: 250
    }

    _hasMounted = false

    state = {
        smallClass: 'img_small',
        largeClass: '',
        loadLargeImg: false
    }

    constructor(props) {
        super(props);

        this.lazyLoadHandler = this.lazyLoadHandler.bind(this);

        if (props.throttle > 0) {
            if (props.debounce) {
                this.lazyLoadHandler = debounce(this.lazyLoadHandler, props.throttle);
            } else {
                this.lazyLoadHandler = throttle(this.lazyLoadHandler, props.throttle);
            }
        }
    }

    componentDidMount() {
        this._hasMounted = true;
        const eventNode = this.getEventNode();

        this.lazyLoadHandler();

        if (this.lazyLoadHandler.flush) {
            this.lazyLoadHandler.flush();
        }

        window.addEventListener('resize', this.lazyLoadHandler);
        eventNode.addEventListener('touchmove', this.lazyLoadHandler);
        eventNode.addEventListener('scroll', this.lazyLoadHandler);
    }

    componentWillUnmount = () => {
        this._hasMounted = false;
    }


    getEventNode() {
        if (!this._hasMounted) return;

        return parentScroll(findDOMNode(this));
    }

    getOffset() {
        const {
            offset, offsetVertical, offsetHorizontal,
            offsetTop, offsetBottom, offsetLeft, offsetRight, threshold,
        } = this.props;

        const _offsetAll = threshold || offset;
        const _offsetVertical = offsetVertical || _offsetAll;
        const _offsetHorizontal = offsetHorizontal || _offsetAll;

        return {
            top: offsetTop || _offsetVertical,
            bottom: offsetBottom || _offsetVertical,
            left: offsetLeft || _offsetHorizontal,
            right: offsetRight || _offsetHorizontal,
        };
    }

    lazyLoadHandler() {
        if (!this._hasMounted) return;

        const offset = this.getOffset(); //取的是属性中的offset,并不是真正的offset
        const node = findDOMNode(this);
        const eventNode = this.getEventNode(); //获取组件的父节点中设置了可滚动属性中最近的一个

        if (inViewport(node, eventNode, offset)) {
            const { onContentVisible } = this.props;

            // this.setState({ visible: true });

            this.loadImg();

            this.detachListeners();

            if (onContentVisible) {
                onContentVisible();
            }
        }
    }

    detachListeners() {
        const eventNode = this.getEventNode();

        window.removeEventListener('resize', this.lazyLoadHandler);

        if (eventNode) {
            eventNode.removeEventListener('touchmove', this.lazyLoadHandler);
            eventNode.removeEventListener('scroll', this.lazyLoadHandler);
        }
    }

    needLoadSmallImg = () => {
        if (this.props.needBlur === false) { //如果用户设置不显示模糊小图，
            return false;                   // 直接跳过，不走下面的if判断
        } else if (this.props.needBlur === true) {
            return true;
        } else if (this.props.needBlur === '' && this.props.imgQual.indexOf('thumb') === -1) {
            return true;
        } else {
            return false;
        }
    }

    getSmallPic = () => {
        let isNeedSamll = this.needLoadSmallImg();

        if (isNeedSamll) {
            return (
                <img ref='imgSmall' src={ buildPicURL(this.props.pid, {size: 'thumb30'}) } styleName={this.state.smallClass}/>
            );
        } else {
            return null;
        }
    }

    loadImg = () => {
        if (!this._hasMounted) return;

        let that = this;

        let isNeedSamll = this.needLoadSmallImg();

        if (isNeedSamll) {
            let imgSmall = new Image();
            imgSmall.src = buildPicURL(this.props.pid, {size: 'thumb30'});

            imgSmall.onload = function () {
                that.setState({
                    smallClass: 'img_small loaded'
                });
            };
        }

        // 2: load large image
        let imgLarge = new Image();
        imgLarge.src = buildPicURL(this.props.pid, {size: this.props.imgQual});

        imgLarge.onload = function () {
            that.setState({
                largeClass: 'loaded'
            });

            if (that.state.smallClass === 'img_small loaded') {
                if (tempSt) {
                    clearTimeout(tempSt);
                }
                const tempSt = setTimeout(()=>{ //为了获得更好的体验增加延迟逻辑
                    if (!this._hasMounted) return;
                    that.refs.imgWrapper.removeChild(that.refs.imgSmall)
                }, 110);
            }

            that.detachListeners();
        };
    }


    render() {
        let pd = this.props.imgH / this.props.imgW; //占位符的高度，撑开空间
        
        return (
            <div styleName='placeholder' ref='imgWrapper'>
                { this.getSmallPic() }
                <div style={{paddingBottom: `${100 * pd}%`}}></div>
                <img src={ buildPicURL(this.props.pid, {size: this.props.imgQual}) } styleName={this.state.largeClass}/>
            </div>
        );
    }
}
