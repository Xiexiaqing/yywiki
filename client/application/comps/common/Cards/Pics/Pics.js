import React from 'react';
import PropTypes from 'prop-types';
import { Card, Grid, Icon, Button } from 'antd-mobile';
import Pipe from 'components/Pipe/Pipe';
import styles from './Pics.css';

export default class Pics extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            show_big: false,
            big_pic_index: -1
        };
    }

    static propTypes = {
        title: PropTypes.string,
        content: PropTypes.string,
        pics: PropTypes.array,
        card_key: PropTypes.string,
        footer_extra: PropTypes.string,
        footer_content: PropTypes.string,
    }

    static defaultProps = {
        title: "",
        content: "",
        pics: [],
        card_key: "",
        footer_extra: "",
        footer_content: ""
    }

    handleGridClick = (el, index) => {
        document.getElementById("app").style.display = "none";

        this.setState({
            show_big: true,
            big_pic_index: index
        });
    }

    handleCloseBigPicLayer = (e) => {
        document.getElementById("app").style.display = "";

        this.setState({
            show_big: false,
            big_pic_index: -1
        });
    }

    handleTurnPage = (turn_type) => {
        if (turn_type === 'last') {
            this.setState({
                big_pic_index: this.state.big_pic_index - 1
            });
        } else if (turn_type === 'next') {
            this.setState({
                big_pic_index: this.state.big_pic_index + 1
            });
        }
    }

    buildBigPicContainer = () => {
        let screen_height = window.screen.height + "px";

        return (
            <Pipe container={ document.body }>
                <div style={{ height: screen_height }}>
                    <div className={ styles["big-pic-container"] } style={{ lineHeight: screen_height }}>
                        <img src={ this.props.pics[this.state.big_pic_index].url } />
                    </div>
                    <div className={ styles["big-pic-tools"] }>
                        <div
                            className={ styles["close-icon"]}
                            onClick={ this.handleCloseBigPicLayer }
                        >
                            <Icon color="#fff" type="cross" size="lg" />
                        </div>
                        <div className={ styles["pic-count"] }>
                            { this.state.big_pic_index + 1 + ' / ' + this.props.pics.length }
                        </div>
                        { this.state.big_pic_index > 0 ? 
                            (<div className={ styles["last-btn"] }>
                                <Button size="small" onClick={ this.handleTurnPage.bind(this, 'last') }>上一页</Button>
                            </div>) : null}
                        { this.state.big_pic_index < this.props.pics.length - 1 ? 
                            (<div className={ styles["next-btn"] }>
                                <Button size="small" onClick={ this.handleTurnPage.bind(this, 'next') }>下一页</Button>
                            </div>) : null}
                    </div>
                </div>
            </Pipe>
        );
    }

    render() {
        let { title, pics, content, card_key, footer_content, footer_extra } = this.props;
        let temp_column_num = 3;

        if (this.props.pics.length < 5 && this.props.pics.length > 1) {
            temp_column_num = 2;
        } else if (this.props.pics.length === 1) {
            temp_column_num = 1;
        }

        return (
            <div>
                <Card key={ card_key }>
                    { title ? <Card.Header title={ title } /> : null }
                    <Card.Body>
                        <Grid
                            onClick={ this.handleGridClick } 
                            data={ pics }
                            columnNum={ temp_column_num }
                            square={ true }
                            hasLine={ false }
                            renderItem={dataItem => (
                                <div style={{ padding: '1px' }}>
                                    <img src={dataItem.url} style={{ width: '100%', height: '100%' }} alt="" />
                                </div>
                            )}/>
                        <div style={{ marginTop: '7px' }}>{ content }</div>
                    </Card.Body>
                    <Card.Footer content={ footer_content} extra={ footer_extra } />
                </Card>
                { this.state.show_big ? this.buildBigPicContainer() : null }
            </div>
        );
    }
}