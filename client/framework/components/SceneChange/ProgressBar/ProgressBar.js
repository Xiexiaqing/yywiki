import PropTypes from 'prop-types';
import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './ProgressBar.css';
let st;

@CSSModules(styles, { allowMultiple: true })
export default class ProgressBar extends React.Component {
    static propTypes = {
        isFinish: PropTypes.bool
    }

    static defaultProps = {
        isFinish: false
    }

    state = {
        p_w : 0, //进度条宽度progress bar width
        p_st: 'progressShape_p1' //进度条class，控制animation during
    }

    componentDidMount = () => {
        let s_w = window.screen.availWidth; //屏幕宽度screen width

        st = setTimeout(()=>{
            this.setState({
                p_w : s_w * 0.99
            });
        }, 0);
    }

    componentWillReceiveProps = (nextProps) => {
        let s_w = window.screen.availWidth; //屏幕宽度screen width

        if (nextProps.isFinish) {
            this.setState({
                p_st: 'progressShape_fast',
                p_w: s_w
            })
        }
    }

    componentWillUnmount = () => {
        clearTimeout(st);
    }

    render() {
        let pw_st = { //进度条宽度样式 progress bar width style
            width : this.state.p_w,
            opacity: this.props.isFinish ? 0 : 1
        }

        return (
            <div styleName="progress">
                <div styleName={`progressShape ${ this.state.p_st }`} style={ pw_st }></div>
            </div>
        );
    }
}
