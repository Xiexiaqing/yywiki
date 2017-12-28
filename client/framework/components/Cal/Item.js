import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class Item extends Component {
    constructor(props, context) {
        super(props, context);
    }

    static propTypes = {
        itemClass: PropTypes.string,
        data: PropTypes.object.isRequired,
        onChoose: PropTypes.func
    }

    static defaultProps = {
        itemClass: '',
        onChoose: () => {},
    }

    handleItemClick = () => {
        this.props.onChoose(this.props.data.content);
    }

    render() {
        if (!this.props.data.content) {
            return <li></li>;
        }

        return (
            <li>
                {
                    this.props.data.click ? (
                        <a
                            href="javascript:void(0)"
                            className={ this.props.itemClass }
                            onClick={ this.handleItemClick }>
                            { this.props.data.content }
                        </a>
                    ) : this.props.data.content
                }
            </li>
        );
    }
}
