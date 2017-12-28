import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import transitionInfo from 'dom-helpers/transition/properties';
import addEventListener from 'dom-helpers/events/on';
import classnames from '../../utils/classnames';

let transitionEndEvent = transitionInfo.end;

export const UNMOUNTED = 0;
export const EXITED = 1;
export const ENTERING = 2;
export const ENTERED = 3;
export const EXITING = 4;

export default class Transition extends React.Component {
    constructor(props, context) {
        super(props, context);

        let initialStatus;
        if (props.in) {
            // Start enter transition in componentDidMount.
            initialStatus = props.transitionAppear ? EXITED : ENTERED;
        } else {
            initialStatus = props.unmountOnExit ? UNMOUNTED : EXITED;
        }
        this.state = { status: initialStatus };

        this.nextCallback = null;
    }

    componentDidMount() {
        if (this.props.transitionAppear && this.props.in) {
            this.performEnter(this.props);
        }
    }

    componentWillReceiveProps(nextProps) {
        const status = this.state.status;
        if (nextProps.in) {
            if (status === EXITING) {
                this.performEnter(nextProps);
            } else if (this.props.unmountOnExit) {
                if (status === UNMOUNTED) {
                    // Start enter transition in componentDidUpdate.
                    this.setState({ status: EXITED });
                }
            } else if (status === EXITED) {
                this.performEnter(nextProps);
            }

            // Otherwise we're already entering or entered.
        } else {
            if (status === ENTERING || status === ENTERED) {
                this.performExit(nextProps);
            }

            // Otherwise we're already exited or exiting.
        }
    }

    componentDidUpdate() {
        if (this.props.unmountOnExit && this.state.status === EXITED) {
            // EXITED is always a transitional state to either ENTERING or UNMOUNTED
            // when using unmountOnExit.
            if (this.props.in) {
                this.performEnter(this.props);
            } else {
                this.setState({ status: UNMOUNTED });
            }
        }
    }

    componentWillUnmount() {
        this.cancelNextCallback();
    }

    performEnter(props) {
        this.cancelNextCallback();
        const node = ReactDOM.findDOMNode(this);

        // Not this.props, because we might be about to receive new props.
        props.onEnter(node);

        this.safeSetState({ status: ENTERING }, () => {
            this.props.onEntering(node);

            this.onTransitionEnd(node, () => {
                this.safeSetState({ status: ENTERED }, () => {
                    this.props.onEntered(node);
                });
            });
        });
    }

    performExit(props) {
        this.cancelNextCallback();
        const node = ReactDOM.findDOMNode(this);

        // Not this.props, because we might be about to receive new props.
        props.onExit(node);

        this.safeSetState({ status: EXITING }, () => {
            this.props.onExiting(node);

            this.onTransitionEnd(node, () => {
                this.safeSetState({ status: EXITED }, () => {
                    this.props.onExited(node);
                });
            });
        });
    }

    cancelNextCallback() {
        if (this.nextCallback !== null) {
            this.nextCallback.cancel();
            this.nextCallback = null;
        }
    }

    safeSetState(nextState, callback) {
        // This shouldn't be necessary, but there are weird race conditions with
        // setState callbacks and unmounting in testing, so always make sure that
        // we can cancel any pending setState callbacks after we unmount.
        this.setState(nextState, this.setNextCallback(callback));
    }

    setNextCallback(callback) {
        let active = true;

        this.nextCallback = (event) => {
            if (active) {
                active = false;
                this.nextCallback = null;

                callback(event);
            }
        };

        this.nextCallback.cancel = () => {
            active = false;
        };

        return this.nextCallback;
    }

    onTransitionEnd(node, handler) {
        this.setNextCallback(handler);

        if (node) {
            addEventListener(node, transitionEndEvent, this.nextCallback);
            setTimeout(this.nextCallback, this.props.timeout);
        } else {
            setTimeout(this.nextCallback, 0);
        }
    }

    render() {
        const status = this.state.status;
        if (status === UNMOUNTED) {
            return null;
        }

        const { children, className, ...childProps } = this.props;
        Object.keys(Transition.propTypes).forEach(key => delete childProps[key]);

        let transitionClassName;
        if (status === EXITED) {
            transitionClassName = this.props.exitedClassName;
        } else if (status === ENTERING) {
            transitionClassName = this.props.enteringClassName;
        } else if (status === ENTERED) {
            transitionClassName = this.props.enteredClassName;
        } else if (status === EXITING) {
            transitionClassName = this.props.exitingClassName;
        }

        let child = React.Children.only(children);
        // child = (
        //     <div>
        //         { child }
        //     </div>
        // );

        return React.cloneElement(
            child,
            {
                ...childProps,
                className: classnames(
                    child.props.className,
                    className,
                    transitionClassName
                )
            }
        );
    }
}

Transition.propTypes = {
    /**
     * 展示 or 隐藏组件
     */
    in: PropTypes.bool,

    /**
     * 是否在不展示组件后销毁组件
     */
    unmountOnExit: PropTypes.bool,

    /**
     * 组件初次渲染时，是否执行动画
     */
    transitionAppear: PropTypes.bool,

    /**
     * 动画的执行延迟，用来确保节点可执行，初始值为5秒，适当设置
     */
    timeout: PropTypes.number,

    /**
     * 组件退出后的class
     */
    exitedClassName: PropTypes.string,
    /**
     * 组件退出过程中的class
     */
    exitingClassName: PropTypes.string,
    /**
     * 组件渲染后的class
     */
    enteredClassName: PropTypes.string,
    /**
     * 组件渲染过程中的class
     */
    enteringClassName: PropTypes.string,

    /**
     * 组件设置渲染中class之前的回调
     */
    onEnter: PropTypes.func,
    /**
     * 组件设置渲染中class之后的回调
     */
    onEntering: PropTypes.func,
    /**
     * 组件设置渲染后的class之后的回调
     */
    onEntered: PropTypes.func,
    /**
     * 组件设置退出过程中的class之前的回调
     */
    onExit: PropTypes.func,
    /**
     * 组件设置退出过程中的class之后的回调
     */
    onExiting: PropTypes.func,
    /**
     * 组件设置退出后的class之后的回调
     */
    onExited: PropTypes.func
};

function noop() {}

Transition.displayName = 'Transition';

Transition.defaultProps = {
    in: false,
    unmountOnExit: false,
    transitionAppear: true,

    timeout: 5000,

    onEnter: noop,
    onEntering: noop,
    onEntered: noop,

    onExit: noop,
    onExiting: noop,
    onExited: noop
};