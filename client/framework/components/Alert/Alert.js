import PropTypes from 'prop-types';
import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './Alert.css';
import Modal from '../Modal/Modal';

function noop() {}
@CSSModules(styles, { allowMultiple: true })
export default class Alert extends React.Component {
    static propTypes = {
        content: PropTypes.string.isRequired, // 提示文案
        onShow: PropTypes.func, // 组件展示后回调函数
        onHide: PropTypes.func, // 组件隐藏后回调函数
        onOk: PropTypes.func, // 点击按钮后回调
        okText: PropTypes.string, // 按钮文案
        hideWhenMaskClick: PropTypes.bool // 点击背景是否隐藏
    }

    static defaultProps = {
        okText: '确定',
        onHide: noop,
        onShow: noop,
        onOk: noop,
        hideWhenMaskClick: false
    }

    state = {
        show: this.props.show
    }

    componentWillReceiveProps = (nextProps) => {
        this.setState({ show: nextProps.show });
    }

    entered = () => {
        this.props.onShow();
    }

    exited = () => {
        this.props.onHide();
    }

    handleMaskClick = () => {
        if (!this.props.hideWhenMaskClick) return;
        this.setState({ show: false });
    }

    handleClick = () => {
        this.props.onOk();
        this.setState({ show: false });
    }

    render() {
        return (
            <Modal
                show={ this.state.show }
                transition={ false }
                onShow={ this.entered }
                onHide={ this.exited }
                withMask={ true }
                isMiddle={ true }
                onMaskClick={ this.handleMaskClick }
            >
                <div styleName="E_layer">
                    <div styleName="content">
                        <div styleName="layer_common">
                            { this.props.content }
                        </div>
                        <ul styleName="E_layer_btn">
                            <li>
                                <a href="javascript:void(0)" onClick={ this.handleClick } styleName="E_btn_grey btn_ok">
                                    { this.props.okText }
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </Modal>
        );
    }
}
