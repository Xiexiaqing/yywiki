import PropTypes from 'prop-types';
import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './Confirm.css';
import Modal from '../Modal/Modal';

function noop() {}
@CSSModules(styles, { allowMultiple: true })
export default class Confirm extends React.Component {
    static propTypes = {
        content: PropTypes.string.isRequired, // 提示文案
        onShow: PropTypes.func, // 组件展示后回调函数
        onHide: PropTypes.func, // 组件隐藏后回调函数
        onOk: PropTypes.func, // 点击确定后回调
        okText: PropTypes.string, // 确定文案
        onCancel: PropTypes.func, // 点击取消后回调
        cancelText: PropTypes.string, // 取消文案
        hideWhenMaskClick: PropTypes.bool // 点击背景是否隐藏
    }

    static defaultProps = {
        okText: '确定',
        cancelText: '取消',
        onHide: noop,
        onShow: noop,
        onOk: noop,
        onCancel: noop,
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

    handleOk = () => {
        this.props.onOk();
        this.setState({ show: false });
    }

    handleCancel = () => {
        this.props.onCancel();
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
                                <a href="javascript:void(0)" onClick={ this.handleCancel } styleName="E_btn_grey">
                                    { this.props.cancelText }
                                </a>
                            </li>
                            <li>
                                <a href="javascript:void(0)" onClick={ this.handleOk } styleName="E_btn_grey btn_ok">
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
