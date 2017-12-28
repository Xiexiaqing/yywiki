import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import CSSModules from 'react-css-modules';
import styles from './NewSlider.css';
import Swipe from './swipe';
import { isSame } from 'utils/differ';

@CSSModules(styles, { allowMultiple: true })
export default class NewSlider extends React.Component {
    static propTypes = {
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
        withDotted: PropTypes.bool,      // 是否需要显示点点点
        dotPostion: PropTypes.string    // dot的位置, inside/bottom
    }

    static defaultProps = {
        auto: 3000,
        speed: 400,
        startSlide: 0,
        slideToIndex: null,
        continuous: false,
        disableScroll: false,
        stopPropagation: false,
        reinitSwipeOnUpdate: false,
        wrapperStyles: {},
        containerStyles: {},
        shouldUpdate: () => null,
        onSliderChange: () => null,
        transitionEnd: () => null,
        isInSlider: () => null,
        withDotted: true,
        dotPostion: 'inside'
    }

    state = {
        selectedIndex: this.props.startSlide
    }

    componentDidMount = () => {
        this.swipe = Swipe(ReactDOM.findDOMNode(this), Object.assign({}, this.props, { callback: this.handleCallBack() }));
    }

    componentDidUpdate = (prevProps) => {
        if (this.props.reinitSwipeOnUpdate || this.props.children.length !== prevProps.children.length) {
            this.swipe.kill();
            this.swipe = Swipe(ReactDOM.findDOMNode(this), Object.assign({}, this.props, { callback: this.handleCallBack() }));
        }
      
        if (this.props.slideToIndex || this.props.slideToIndex === 0) {
            this.swipe.slide(this.props.slideToIndex);
        }
    }

    componentWillUnmount = () => {
        this.swipe.kill();
        this.swipe = null;
    }

    shouldComponentUpdate = (nextProps) => {
        return (
            (this.props.slideToIndex != nextProps.slideToIndex) ||
            (this.props.shouldUpdate && typeof this.props.shouldUpdate === 'function' && 
            this.props.shouldUpdate(nextProps, this.props)) || 
            !isSame(nextProps.children, this.props.children)
        );
    }

    componentWillReceiveProps = (nextProps) => {
        // 属性变化时不重绘slider
        if (this.props.children.length !== nextProps.children.length || nextProps.reinitSwipeOnUpdate) {
            this.setState({ selectedIndex: this.props.startSlide })
        }
    }

    handleCallBack = () => {
        // arrow function 是定义时所在对象，所以此处不指向component,需要这么搞
        var self = this;
        return (index) => {
            if (index >= self.props.children.length) {
                index = index % self.props.children.length;
            }

            self.props.onSliderChange(index);
            self.setState({ selectedIndex: Number(index) });
            self.forceUpdate();
        }
    }

    handleDotClick = (index) => {
        this.swipe && this.swipe.slide(index);
    }

    buildSliders = () => {
        // 只有一个节点时，children是一个对象
        if (!Array.isArray(this.props.children)) {
            return React.cloneElement(this.props.children, { className: styles.child, key: 0 });
        }

        // 当需要循环时，需要复制两个来适配循环播放
        if (this.props.continuous && this.props.children.length === 2) {
            let temp = this.props.children.map((child, i) => 
                React.cloneElement(child, { className: styles.child, key: i + this.props.children.length })
            );
            return temp.concat(temp.map((child, i) => 
                React.cloneElement(child, { className: styles.child, key: i })
            ));
        }

        return this.props.children.map((child, i) => 
            React.cloneElement(child, { className: styles.child, key: i })
        );
    }

    buildDots = () => {
        if (!this.props.withDotted || !Array.isArray(this.props.children)) { return null; }

        let children = Array.apply(null, Array(this.props.children.length)).map((item, i) => {
            if (i === this.state.selectedIndex) {
                return <span key={ i } styleName="dots dots_active" onClick={ this.handleDotClick.bind(this, i) }>
                </span>;
            } else {
                return <span key={ i } styleName="dots" onClick={ this.handleDotClick.bind(this, i) }>
                </span>;
            }
        });

        let tempStyle = this.props.dotPostion === 'inside' ? 'inside_dots_wrapper' : 'dots_wrapper';

        return (
            <div styleName={ tempStyle }>
                { children }
            </div>
        )
    }

    render() {
        return (
            <div style={ Object.assign({}, this.props.containerStyles) } className={ styles.container } >
                <div style={ Object.assign({}, this.props.wrapperStyles) } className={ styles.wrapper } >
                    { this.buildSliders() }
                </div>
                { this.buildDots() }
            </div>
        );
    }
}
