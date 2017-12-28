import PropTypes from 'prop-types';
import React from 'react';
import styles from './Toast.css';
import Modal from '../Modal/Modal';

function noop() {}
let timer = null;

export default class Toast extends React.Component {
    static propTypes = {
        content: PropTypes.string.isRequired, // 组件提示文案
        autohide: PropTypes.bool, // 是否自动隐藏
        lasttime: PropTypes.number, // 组件展示时间
        onShow: PropTypes.func, // 组件显示后回调函数
        onHide: PropTypes.func, // 组件隐藏后的回调函数
        style: PropTypes.object, // 属性自带样式继承
        show: PropTypes.bool
    }

    static defaultProps = {
        autohide: true,
        lasttime: 2000,
        style: {},
        show: false,
        
        onHide: noop,
        onShow: noop
    }

    state = {
        show: this.props.show
    }

    componentWillReceiveProps = (nextProps) => {
        this.setState({
            show: nextProps.content === '' ? false : true
        });
    }

    shouldComponentUpdate = (nextProps, nextStates) => {
        if (this.state.show === nextStates.show) return false;

        return true;
    }

    componentDidMount = () => {
        if (!this.props.autohide || !this.state.show) return;

        let that = this;
        clearTimeout(timer);
        timer = setTimeout(function(){
            that.props.content && that.setState({ show: false });
        }, this.props.lasttime);
    }

    componentDidUpdate = () => {
        if (!this.props.autohide || !this.state.show) return;

        let that = this;
        clearTimeout(timer);
        timer = setTimeout(function(){
            that.props.content && that.setState({ show: false });
        }, this.props.lasttime);
    }

    render() {
        let isShow = this.props.content ? (this.state.show ? true : false) : false;
        let transitionClassOpts = {
            className: styles['fadelayer'],
            enteredClassName: styles['fadein'],
            enteringClassName: styles['fadein']
        }

        return (
            <Modal
                show={ isShow }
                transition={ true }
                isMiddle={ true }
                onShow={ this.entered }
                onHide={ this.exited }
                transitionClassOpts={ transitionClassOpts }
                onMaskClick={ this.handleMaskClick }
                onEscapeKeyUp={ this.handleEscapeKeyUp }
            >
                <div className={ styles["layer_main_wrap"] } style={ this.props.style } ref="toastLayer" key={ this.props.content }>
                    <div className={ styles["layer_wrap"] }>
                    </div>
                    <div className={ styles["inner"] }>
                        { this.props.content }
                    </div>
                </div>
            </Modal>
        );
    }

    entered = () => {
        this.props.onShow && this.props.onShow();
    }

    exited = () => {
        this.props.onHide && this.props.onHide();
    }

    handleMaskClick = () => {
        clearTimeout(timer);
        this.setState({ show: false });
    }

    handleEscapeKeyUp = () => {
        clearTimeout(timer);
        this.setState({ show: false });
    }
}
