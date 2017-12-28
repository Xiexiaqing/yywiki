import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './SceneChange.css';

@CSSModules(styles, { allowMultiple: true })
export default class SceneChange extends React.Component {
    static propTypes = {
    }

    static defaultProps = { 
    }

    render() {
        return (
            <div styleName="E_loading">
                <div styleName="loading_cont W_tc">
                    <p styleName="E_MB10">
                        <i styleName="W_loading_big"></i>
                    </p>
                </div>
            </div>
        );
    }
}
