import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd-mobile';
import { doJumpPage } from 'kits/io/redirect';

export default class Article extends React.Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        title: PropTypes.string,
        content: PropTypes.string,
        img_url: PropTypes.string,
        card_key: PropTypes.string,
        footer_extra: PropTypes.string,
        footer_content: PropTypes.string,
        article_id: PropTypes.string
    }

    static defaultProps = {
        title: "",
        content: "",
        img_url: "",
        card_key: "",
        footer_extra: "",
        footer_content: "",
        article_id: ""
    }

    handleToArticle = () => {
        doJumpPage('/article?article_id=' + this.props.article_id);
    }

    render() {
        let { title, img_url, content, card_key, footer_content, footer_extra } = this.props;
        
        return (
            <Card key={ card_key } onClick={ this.handleToArticle }>
                { title ? <Card.Header title={ title } /> : null }
                <Card.Body>
                    <div>
                        <img style={{ width: "100%" }} src={ img_url } /> 
                        <div style={{ marginTop: '7px' }}>{ content }</div>
                    </div>
                </Card.Body>
                <Card.Footer content={ footer_content } extra={ footer_extra } />
            </Card>
        );
    }
}