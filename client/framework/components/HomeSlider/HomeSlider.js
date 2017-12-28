import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import CSSModules from 'react-css-modules';
import styles from './HomeSlider.css';
import Swipe from './swipe';
import { isSame } from 'utils/differ';
import fromWeibo from 'utils/fromWeibo';

const BASE_WIDTH = 640;
const WIDTH_HEIGHT_RATIO = 1.766666;
const SCREEN_WIDTH = document.documentElement.clientWidth;
const WIDTH_MIDDLE = 0.828125;
const WIDTH_OTHER = 0.715625;
const LEFT_MIDDLE = (1 - WIDTH_MIDDLE)/2;
const LEFT_LEFT = 0.16;
const LEFT_RIGHT = 1 + LEFT_LEFT - WIDTH_OTHER;
const LEFT_OTHER = (1 - WIDTH_OTHER)/2;
const TOP_OTHER = (WIDTH_MIDDLE - WIDTH_OTHER) / (2 * WIDTH_HEIGHT_RATIO);

@CSSModules(styles, { allowMultiple: true })
export default class HomeSlider extends React.Component {
    static propTypes = {
        sliderData: PropTypes.array.isRequired,     // 自动slider开始时间
        auto: PropTypes.number,     // 自动slider开始时间
        speed: PropTypes.number,    // slider切换时间
        startSlide: PropTypes.number,   // 起始slider位置
        slideToIndex: PropTypes.number, // 设置渲染完成后slider到哪个位置
        continuous: PropTypes.bool,     // 是否循环
        disableScroll: PropTypes.bool,  // 阻止全部该容器下的touch事件
        stopPropagation: PropTypes.bool,    // 阻止事件冒泡
        reinitSwipeOnUpdate : PropTypes.bool,   // 组件更新时是否重新初始化
        wrapperStyles: PropTypes.object,    // slider外层样式
        containerStyles: PropTypes.object,  // 容器样式
        shouldUpdate: PropTypes.func,   // 自定义是否重绘方法
        onSliderChange: PropTypes.func,   // slider切换时的回调函数
        transitionEnd: PropTypes.func,   // 动画执行后的回调函数
        isInSlider: PropTypes.func,     // 是否在slider内部滑动
        sudaFunc: PropTypes.func,     // suda
        withDotted: PropTypes.bool,      // 是否需要显示点点点
        imgPosition: PropTypes.object,   //图片位置
        sliderStyle: PropTypes.object,
        showLable: PropTypes.bool,
        showTitle: PropTypes.bool
    }

    static defaultProps = {
        isInSlider: () => null,
        withDotted: true,
        reinitSwipeOnUpdate: true,
        onSliderChange: () => null,
        startSlide: 0,
        imgPosition: {},
        sliderStyle: styles,
        showLable: true,
        showTitle: true
    }

    _hasMounted = false

    state = {
        selectedIndex: this.props.startSlide,
        sliderWidth:document.documentElement.clientWidth
    }

    componentDidMount = () => {
        this._hasMounted = true
        this.swipe = Swipe(ReactDOM.findDOMNode(this), Object.assign({}, this.props, { callback: this.handleCallBack }));
    }

    componentDidUpdate = (prevProps) => {
        if (this.props.reinitSwipeOnUpdate) {
            var _curIndex = this.swipe.getPos();
            this.swipe.kill();
            this.swipe = null;
            this.swipe = Swipe(ReactDOM.findDOMNode(this), Object.assign({}, this.props, { callback: this.handleCallBack }, { startSlide: _curIndex }));
        }
    }

    componentWillUnmount = () => {
        this.swipe.kill();
        this.swipe = null;
        this._hasMounted = false
    }

    shouldComponentUpdate = (nextProps) => {
        return (
            (this.props.slideToIndex != nextProps.slideToIndex) ||
            (this.props.shouldUpdate && typeof this.props.shouldUpdate === 'function' && 
            this.props.shouldUpdate(nextProps, this.props)) || 
            !isSame(nextProps.children, this.props.children) ||
            !isSame(nextProps.sliderData, this.props.sliderData)
        );
    }

    componentWillReceiveProps = (nextProps) => {
        // 属性变化时不重绘slider
        if (nextProps.reinitSwipeOnUpdate) {
            this.setState({ selectedIndex: this.props.startSlide });
        }
    }

    handleCallBack = (index, forceUpdate) => {
        if (!this._hasMounted) return;
        this.setState({ selectedIndex: index, sliderWidth:document.documentElement.clientWidth });
        forceUpdate && this.forceUpdate();
    }

    getPixel = (percent) => {
        return Math.ceil(document.documentElement.clientWidth*percent);
    }

    getStyle = (index, len, posArr)=>{
        var _index = this.props.startSlide;
        if (index === 0){
            return posArr.current;
        }
        if (index === (len - 1)){
            return posArr.left;
        }
        if (index === 1) {
            return posArr.right;
        }
        return posArr.none;
    }

    buildSliders = () => {
        var listData = this.props.sliderData;
        var len = listData.length;
        this.props.imgPosition = {
            current: {zIndex: 100, top: 0, left: this.getPixel(LEFT_MIDDLE), width:this.getPixel(WIDTH_MIDDLE), height:this.getPixel(WIDTH_MIDDLE/WIDTH_HEIGHT_RATIO), opacity:1},
            left   : {zIndex: 50, top: this.getPixel(TOP_OTHER), left: -this.getPixel(LEFT_LEFT), width:this.getPixel(WIDTH_OTHER), height:this.getPixel(WIDTH_OTHER/WIDTH_HEIGHT_RATIO), opacity:0.5},
            right  : {zIndex: 25, top: this.getPixel(TOP_OTHER), left: this.getPixel(LEFT_RIGHT), width:this.getPixel(WIDTH_OTHER), height:this.getPixel(WIDTH_OTHER/WIDTH_HEIGHT_RATIO), opacity:0.5},
            none   : {zIndex: -10, top: this.getPixel(TOP_OTHER), left: this.getPixel(LEFT_OTHER), width:this.getPixel(WIDTH_OTHER), height:this.getPixel(WIDTH_OTHER/WIDTH_HEIGHT_RATIO), opacity:0.5}
        };
        return listData.map((item, index) => {
            var _style = this.getStyle(index, len, this.props.imgPosition);
            //h5必填，schema选填；
            var _link =fromWeibo()?(item["schema_url"] || item["h5_url"]):item["h5_url"];
            let listItem = (
                <li key={ index } ref={ "item"+index } style={_style} data-href={_link}>
                    <a target="_blank">
                        {this.props.showLable?<span className={ styles['slider_tag'] } >{item['label']}</span>:""}
                        <img src={ item['pic_url']} onLoad={this.onImgLoaded} alt={index === this.state.selectedIndex?"cur":""}/>
                    </a>
                </li>
            );

            return listItem;
        });
    }

    buildDots = () => {
        if (!this.props.withDotted || this.props.children.length < 2) { return null; }

        let children = Array.apply(null, Array(this.props.children.length)).map((item, i) => {
            if (i === this.state.selectedIndex) {
                return <span key={ i } styleName="dots dots_active">
                </span>;
            } else {
                return <span key={ i } styleName="dots">
                </span>;
            }
        });
        return (
            <div styleName="dots_wrapper">
                { children }
            </div>
        )
    }

    onImgLoaded = (evt) =>{
        //图片加载完成，渐入显示；
        evt.target.parentNode.parentNode.style.opacity = !evt.target.getAttribute("alt")?0.5:1;
    }

    render() {
        var _curIndex = (this.swipe && this.swipe.getPos()) || 0;
        return (
            <div style={ Object.assign({}, this.props.containerStyles) }
                 className={ styles.container } >
                <div style={ {width:this.state.sliderWidth,
                        height:this.getPixel(WIDTH_MIDDLE/WIDTH_HEIGHT_RATIO)+10} }
                     className={ styles.wrapper } >
                    <ul className={ styles["slider_images_list"] }>
                        { this.buildSliders() }
                    </ul>
                </div>
                {this.props.showTitle?<div className={ styles["slider_title"] }>
                    {this.props.sliderData[_curIndex]['recommend_content']}
                </div>:""}
                { this.buildDots() }
            </div>
        );
    }
}
