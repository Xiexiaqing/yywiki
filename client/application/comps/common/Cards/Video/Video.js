import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd-mobile';

export default class Video extends React.Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        title: PropTypes.string,
        content: PropTypes.string,
        video_url: PropTypes.string,
        card_key: PropTypes.string,
        footer_extra: PropTypes.string,
        footer_content: PropTypes.string,
    }

    static defaultProps = {
        title: "",
        content: "",
        video_url: "",
        card_key: "",
        footer_extra: "",
        footer_content: ""
    }

    render() {
        let { title, video_url, content, card_key, footer_content, footer_extra } = this.props;
        
        return (
            <Card key={ card_key }>
                { title ? <Card.Header title={ title } /> : null }
                <Card.Body>
                    <div>
                        <video src={ video_url } controls="controls" style={{ width: "100%", maxHeight: '300px'}}/>
                        <div style={{ marginTop: '7px' }}>{ content }</div>
                    </div>
                </Card.Body>
                <Card.Footer content={ footer_content } extra={ footer_extra } />
            </Card>
        );
    }
}