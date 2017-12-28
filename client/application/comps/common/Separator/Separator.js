import React from 'react';
import PropTypes from 'prop-types';

export default class Separator extends React.Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        height: PropTypes.number,
        key: PropTypes.string
    }

    static defaultProps = {
        height: 8,
        key: new Date().getTime() + ""
    }

    render() {
        return (
            <div
                key={ this.props.key }
                style={{
                    backgroundColor: '#F5F5F9',
                    height: this.props.height,
                    borderTop: '1px solid #ECECED',
                    borderBottom: '1px solid #ECECED',
                }}
            />
        );
    }
}