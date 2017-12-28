import React from 'react';
import PropTypes from 'prop-types';
import { isSame } from 'utils/differ';
import empty_img from 'statics/images/icon_noContent.png';
import styles from './Empty.css';

export default class Empty extends React.Component {
    static propTypes = {
        content: PropTypes.string
    }
    
    static defaultProps = {
        content: "",
        skipContent: {
            commonText: "",
            skipText: "",
            skipUrl: ""
        }
    }

    shouldComponentUpdate = (nextProps, nextState) => {
        return !isSame(this.props, nextProps) || !isSame(this.state, nextState);
    }

    getSkip = () => {
        if (!this.props.skipContent) return null;
        else {
            return (
                <p>
                    { this.props.skipContent.commonText }
                    <a href={this.props.skipContent.skipUrl}>{ this.props.skipContent.skipText }</a>
                </p>
            );
        }
    }

    getIcon = () => {
        if (this.props.icon){
            return <img src={ this.props.icon } style={ this.props.iconStyle } alt={ this.props.content } />;
        } else {
            return <img src={ empty_img } alt={ this.props.content } />;
        }
    }

    render() {
        return (
            <div className={ styles["empty_list"] }>
                { this.getIcon() }
                <div className={ styles["empty_content"] }>
                    <p>{ this.props.content }</p>
                    { this.getSkip() }
                </div>
            </div>
        );
    }
}