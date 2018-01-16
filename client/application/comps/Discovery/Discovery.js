import React from 'react';
import ReactDOM from 'react-dom';
import createContainer from 'lib/createContainer';
import CustomListView from 'comps/common/CustomListView/CustomListView';
import { TabBar, Drawer, List, NavBar, Icon, Radio, ListView, Grid, Card } from 'antd-mobile';
import Text_Card from 'comps/common/Cards/Text/Text';
import Pics_Card from 'comps/common/Cards/Pics/Pics';
import Article_Card from 'comps/common/Cards/Article/Article';
import Video_Card from 'comps/common/Cards/Video/Video';
import Empty from 'comps/common/Empty/Empty';

const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let wrapProps;
if (isIPhone) {
    wrapProps = {
        onTouchStart: e => e.preventDefault(),
    };
}

const SECTION_MAPPER = {
    video: "视频",
    music: "歌曲"
};

class Discovery extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            selected_type: 'all'
        }
    }

    handleLoadData = (cb) => {
        this.context.createAction("home.index.getList", {
            type: this.state.selected_type,
            page: this.props.page + 1
        });
        
        cb();
    }

    buildListViewRow = (rowData, sectionID, rowID) => {
        const obj = rowData;
        let card_data = {
            title: rowData.title,
            content: rowData.text,
            footer_extra: rowData.date,
            card_key: rowID
        };

        if (obj.type === "text") {
            return <Text_Card { ...card_data } />;
        } else if (obj.type === 'pic') {
            card_data.pics = rowData.pics;

            return <Pics_Card { ...card_data } />;
        } else if (obj.type === 'article') {
            card_data.img_url = rowData.img_url;
            card_data.article_id = rowData.article_id;

            return <Article_Card { ...card_data } />;
        } else if (obj.type === 'video') {
            card_data.video_url = rowData.video_url;

            return <Video_Card { ...card_data } />
        }
    }

    buildSectionTitle = (sectionData, sectionID) => {
        return (
            <div className="sticky">
                <span>{ SECTION_MAPPER[sectionID] }</span>
            </div>
        );
    }

    buildListView = () => {
        // return <Empty content="暂无内容"/>;

        let temp_data = {
            video: [
                {
                    type: "video",
                    title: "小兔兵兵-秋千",
                    text: "",
                    date: "2018-01-16",
                    video_url: "/resource/videos/1.mp4"
                }
            ]
        };

        return (
            <CustomListView
                list_data={ temp_data }
                has_more={ false }
                onRenderRow={ this.buildListViewRow }
                onRenderSectionTitle={ this.buildSectionTitle }
                onLoad={ this.handleLoadData }/>
        );
    }

    handleToMine = () => {
        this.context.router.push('/mine');
    }

    handleToHome = () => {
        this.context.router.push('/home');
    }

    render() {
        return (
            <div>
                <NavBar
                    mode="light"
                    icon={ null }
                    onLeftClick={ null }
                    rightContent={ null }
                >
                    发现
                </NavBar>
                <div style={{ height: 570 }}>{ this.buildListView() }</div>
                <TabBar
                    unselectedTintColor="#949494"
                    tintColor="#33A3F4"
                    barTintColor="white"
                >
                    <TabBar.Item
                        title="首页"
                        key="home"
                        icon={
                        <div style={{
                                width: '22px',
                                height: '22px',
                                background: 'url(https://gw.alipayobjects.com/zos/rmsportal/BTSsmHkPsQSPTktcXyTV.svg) center center /  21px 21px no-repeat' }}
                            />
                        }
                        selectedIcon={
                        <div style={{
                                width: '22px',
                                height: '22px',
                                background: 'url(https://gw.alipayobjects.com/zos/rmsportal/ekLecvKBnRazVLXbWOnE.svg) center center /  21px 21px no-repeat' }}
                            />
                        }
                        selected={ false }
                        onPress={ this.handleToHome } />
                    <TabBar.Item
                        title="发现"
                        key="discovery"
                        icon={
                        <div style={{
                                width: '22px',
                                height: '22px',
                                background: 'url(https://zos.alipayobjects.com/rmsportal/asJMfBrNqpMMlVpeInPQ.svg) center center /  21px 21px no-repeat' }}
                            />
                        }
                        selectedIcon={
                        <div style={{
                                width: '22px',
                                height: '22px',
                                background: 'url(https://zos.alipayobjects.com/rmsportal/gjpzzcrPMkhfEqgbYvmN.svg) center center /  21px 21px no-repeat' }}
                            />
                        }
                        selected={ true }
                        onPress={ null } />
                    <TabBar.Item
                        title="我"
                        key="mine"
                        icon={
                            <div style={{
                                width: '22px',
                                height: '22px',
                                background: 'url(https://zos.alipayobjects.com/rmsportal/psUFoAMjkCcjqtUCNPxB.svg) center center /  21px 21px no-repeat' }}
                            />
                        }
                        selectedIcon={
                            <div style={{
                                width: '22px',
                                height: '22px',
                                background: 'url(https://zos.alipayobjects.com/rmsportal/IIRLrXXrFAhXVdhMWgUI.svg) center center /  21px 21px no-repeat' }}
                            />
                        }
                        selected={ false }
                        onPress={ this.handleToMine } />
                </TabBar>
            </div>
        );
    }
}

export default createContainer([
])(Discovery);