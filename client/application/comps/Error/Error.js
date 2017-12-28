import PropTypes from 'prop-types';
import React from 'react';

import CSSModules from 'react-css-modules';
import styles from './Error.css';
import img404 from './404.png';
@CSSModules(styles)

export default class Error extends React.Component {
    static contextTypes = {
        router: PropTypes.object.isRequired
    }

    goHome = () => {
        this.context.router.push('/login');
    }

    render() {
        let errorImg = img404;
        let errorTxt = '页面找不到啦！';

        return (
            <div styleName="lottery_error">
                <div styleName="error_img">
                    <img src={ errorImg } />
                </div>
                <p>{ errorTxt }</p>
                {/* <div styleName="btn_wrap">
                    <a styleName="btn_submit" href="javascript:;" onClick={ this.goHome }>返回首页</a>
                </div> */}
            </div>
        );
    }
}
