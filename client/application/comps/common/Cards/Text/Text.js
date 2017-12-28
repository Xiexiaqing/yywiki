import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd-mobile';

export default class Text extends React.Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        title: PropTypes.string,
        content: PropTypes.string,
        card_key: PropTypes.string,
        footer_extra: PropTypes.string,
        footer_content: PropTypes.string,
    }

    static defaultProps = {
        title: "",
        content: "",
        card_key: "",
        footer_extra: "",
        footer_content: ""
    }

    render() {
        let { title, content, card_key, footer_content, footer_extra } = this.props;
        
        return (
            <Card key={ card_key }>
                { title ? <Card.Header title={ title } /> : null }
                <Card.Body>
                    <div>{ content }</div>
                </Card.Body>
                <Card.Footer content={ footer_content } extra={ footer_extra } />
            </Card>
        );
    }
}