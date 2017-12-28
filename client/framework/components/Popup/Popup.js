import PropTypes from 'prop-types';
import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './Popup.css';
import Modal from '../Modal/Modal';

function noop() {}

@CSSModules(styles, { allowMultiple: true })
export default class Popup extends React.Component {
    static propTypes = {
        content: PropTypes.string, // 组件提示文案
        onShow: PropTypes.func, // 组件展示后回调函数
        onHide: PropTypes.func, // 组件隐藏后回调函数
        onChoose: PropTypes.func, // 选择某项后回调函数
        cancelTxt: PropTypes.string, // 弹层取消按钮文案
        data: PropTypes.array, // 弹层选项数组
        hideWhenMaskClick: PropTypes.bool // 点击蒙层是否隐藏组件
    }

    static defaultProps = {
        content: '提示',
        cancelTxt: '取消',
        data: [{ val: 'submit', text: '确定' }],
        hideWhenMaskClick: true,

        onHide: noop,
        onShow: noop,
        onChoose: noop
    }

    state = {
        show: this.props.show
    }

    entered = () => {
        this.props.onShow();
    }

    exited = () => {
        this.props.onHide && this.props.onHide();
    }

    componentWillReceiveProps = (nextProps) => {
        this.setState({ show: nextProps.show });
    }

    handleEscapeKeyUp = () => {
        this.setState({ show: false });
    }

    handleMaskClick = () => {
        if (!this.props.hideWhenMaskClick) return;
        this.setState({ show: false });
    }

    handleClick = (val, text) => {
        if (!this.state.show) return;
        this.setState({ show: false });
        this.props.onChoose && this.props.onChoose(val, text);
    }

    render() {
        let layerTransitionClassOpts = {
            enteredClassName: styles['layer_bottom_show'],
            enteringClassName: styles['layer_bottom_show'],
            exitedClassName: styles['layer_bottom_hide'],
            exitingClassName: styles['layer_bottom_hide']
        };

        let maskTransitionClassOpts = {
            enteredClassName: styles['mask_bottom_show'],
            enteringClassName: styles['mask_bottom_show'],
            exitedClassName: styles['mask_bottom_hide'],
            exitingClassName: styles['mask_bottom_hide']
        };

        let allData = this.props.data.map((item, i) => {
            return (
                <li styleName="pop_bar publish" key={ i } onClick={ this.handleClick.bind(this, item.val, item.text) }>{ item.text }</li>
            );
        });

        return (
            <Modal
                show={ this.state.show }
                transition={ true }
                onShow={ this.entered }
                onHide={ this.exited }
                withMask={ true }
                onEscapeKeyUp={ this.handleEscapeKeyUp }
                transitionClassOpts= { layerTransitionClassOpts }
                maskTransitionClassOpts= { maskTransitionClassOpts }
                onMaskClick={ this.handleMaskClick }
            >
                <div styleName="mask" style={ { display: 'block', zIndex: 10002 } }>
                    <ul styleName="pop">
                        <li styleName="pop_bar title"> { this.props.content } </li>
                        { allData }
                        <li styleName="pop_bar cancel" onClick={ this.handleClick.bind(this, 'cancel', '取消') }>取消</li>
                    </ul>
                </div>
            </Modal>
        );
    }
}
