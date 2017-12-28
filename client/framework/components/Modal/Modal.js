import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import addEventListener from 'dom-helpers/events/on';
import removeEventListener from 'dom-helpers/events/off';
import Transition from '../Transition/Transition';
import scrollPos from '../../utils/scrollPos';
import Pipe from '../Pipe/Pipe';
import styles from './Modal.css';

function noop() {}

export default class Modal extends React.Component {
    static propTypes = {
        show: PropTypes.bool, // 展示 or 隐藏组件
        onShow: PropTypes.func, // 展示组件后的回调
        onHide: PropTypes.func, // 隐藏组件后的回调
        onEscapeKeyUp: PropTypes.func, // 按ESC键的回调
        transition: PropTypes.bool, // 是否动画过渡
        transitionClassOpts: PropTypes.object, // 若采用动画过度，动画执行的参数
        maskTransitionClassOpts: PropTypes.object, // 若采用动画过度，动画执行的参数
        maskStyle: PropTypes.object, // 蒙层组件的内联样式
        onMaskClick: PropTypes.func, // 点击蒙层以后的回调
        maskClassName: PropTypes.string, // 蒙层组件的class名
        className: PropTypes.string, // 组件的继承class
        isMiddle: PropTypes.bool, // 是否居中显示
        withMask: PropTypes.bool, // 是否有遮罩层
        children: PropTypes.node, // 孩子节点
        pos: PropTypes.object,
        zIndex: PropTypes.string
    };

    static defaultProps = {
        show: false,
        withMask: true,
        transition: false,
        transitionClassOpts: {
            exitedClassName: '',
            exitingClassName: '',
            enteredClassName: '',
            enteringClassName: ''
        },
        maskTransitionClassOpts: null,
        maskStyle: {},
        maskClassName: styles['transparent_mask'],
        isMiddle: false,

        onMaskClick: noop,
        onHide: noop,
        onShow: noop,
        onEscapeKeyUp: noop,

        className: '',
        pos: null,
        zIndex: "100010"
    };

    static childContextTypes = {
        setMiddle: PropTypes.func,
        setPosition: PropTypes.func
    }

    getChildContext = () => {
        return {
            setMiddle: this.setMiddle,
            setPosition: this.setPosition
        };
    }

    state = {
        exited: !this.props.show,
        l: 0,
        t: 0
    }

    componentWillReceiveProps = (nextProps) => {
        if (nextProps.show) {
            this.setState({ exited: false });
        }
    }

    componentWillUpdate = (nextProps) => {
    }

    componentDidMount = () => {
        if (!this.props.transition && this.props.show) {
            this.onShow();
        }

        if (this.props.isMiddle) {
            this.setMiddle(ReactDOM.findDOMNode(this.refs.container));
        }

        if (!this.props.isMiddle && this.props.pos) {
            this.setPosition(this.props.pos);
        }
    }

    componentDidUpdate = (prevProps) => {
        let { transition } = this.props;

        if (prevProps.show && !this.props.show && !transition) {
            this.onHide();
        } else if (!prevProps.show && this.props.show) {
            this.onShow();
            if (this.props.isMiddle) {
                this.setMiddle(ReactDOM.findDOMNode(this.refs.container));
            }
            
            if (!this.props.isMiddle && this.props.pos) {
                this.setPosition(this.props.pos);
            }
        }
    }

    componentWillUnmount = () => {
        if (!this.props.transition && this.props.show) {
            this.onHide();
        }
    }

    renderBackMask = () => {
        let backdrop = (
            <div ref="backdrop"
                style={ this.props.maskStyle }
                className={ this.props.maskClassName }
                onClick={ this.handleBackdropClick } />
        );

        let tempMaskCss = this.props.maskTransitionClassOpts;

        if (this.props.transition) {
            backdrop = (
                <Transition
                    in={ this.props.show }
                    timeout={ 2000 }
                    { ...tempMaskCss }
                >
                    { backdrop }
                </Transition>
            );
        }

        return backdrop;
    }

    handleBackdropClick = (e) => {
        if (e.target !== e.currentTarget) {
            return;
        }

        this.props.onMaskClick();
    }

    onShow = () => {
        addEventListener(document.body, 'keyup', this.handleDocumentKeyUp);
        this.props.onShow();
    }

    onHide = () => {
        removeEventListener(document.body, 'keyup', this.handleDocumentKeyUp);
        this.props.onHide();
        this.setState({ exited: true });
    }

    getDialogElement = () => {
        let node = this.refs.modal;
        return node && node.lastChild;
    }

    setMiddle = (layerNode) => {
        if (!layerNode) return;
        layerNode = layerNode.firstChild;

        let layerSize = {};
        layerSize.w = layerNode.offsetWidth;
        layerSize.h = layerNode.offsetHeight;

        let winSize = {};
        winSize.w = window.innerWidth;
        winSize.h = window.innerHeight;

        let _top = scrollPos().t + (winSize.h - layerSize.h) / 2;
        let _left = (winSize.w - layerSize.w) / 2;

        if(_top<=10){_top=10;}

        this.setState({ l: _left, t: _top });
    }

    setPosition = (pos = { l: 0, t: 0 }) => {
        this.setState({ l: pos.l, t: pos.t });
    }

    handleDocumentKeyUp = (e) => {
        if (e.keyCode === 27) {
            this.props.onEscapeKeyUp(e);
        }
    }

    render() {
        let { show, transition, transitionClassOpts, maskStyle, ...props } = this.props;

        let dialog = React.Children.only(this.props.children);

        const mountModal = show || (transition && !this.state.exited);

        if (!mountModal) {
            return null;
        }

        if (transition) {
            dialog = (
                <Transition
                    ref={ "container" }
                    in={ show }
                    timeout={ 1000 }
                    onExited={ this.onHide }
                    onEntered={ this.onShow }
                    { ...transitionClassOpts }
                >
                    { dialog }
                </Transition>
            );
        } else {
            dialog = (
                <div ref={ "container" } >
                    { dialog }
                </div>
            );
        }

        let modal_style = {};
        if (this.props.isMiddle || this.props.pos) {
            modal_style = {
                left: this.state.l,
                top: this.state.t,
                position: 'absolute'
            };
        }
        
        return (
            <Pipe container={ props.container || null }>
                <div
                    ref={ 'modal' }
                    style= { modal_style }
                    className={ props.className }
                >
                    { this.props.withMask && this.renderBackMask() }
                    <div style={{ position: 'absolute', zIndex: this.props.zIndex }} className={props.className}>
                        { dialog }
                    </div>
                </div>
            </Pipe>
        );
    }
}
