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

const RadioItem = Radio.RadioItem;
const TYPE_MAPPER = [
    { value: 'all', label: "全部" },
    { value: 'text', label: "文字" },
    { value: 'pic', label: "图片" },
    { value: 'video', label: "视频"},
    { value: 'article', label: "文章" }
];

const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let wrapProps;
if (isIPhone) {
    wrapProps = {
        onTouchStart: e => e.preventDefault(),
    };
}

class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            selected_type: 'all'
        }
    }

    onOpenChange = (...args) => {
        this.setState({ open: !this.state.open });
    }

    handleChangeType = (selected_type) => {
        this.setState({
            selected_type,
            open: false
        });

        this.context.createAction("home.index.getList", {
            type: selected_type,
            page: 1
        });
    }

    buildSideBar = () => {
        return (
            <List>
                { TYPE_MAPPER.map((item, i) => {
                    return (
                        <RadioItem key={ item.value } checked={ this.state.selected_type === item.value } onChange={ this.handleChangeType.bind(this, item.value) }>
                            { item.label }
                        </RadioItem>
                    );
                })}
            </List>
        );
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
        let days = Math.ceil((new Date(sectionID).getTime() - new Date(this.props.birthday).getTime()) / (24 * 3600 * 1000)) + 1;
        days += "天";

        return (
            <div className="sticky">
                <span>{ sectionID }</span>
                <span style={{ fontSize: "16px", paddingLeft: "10px" }}>{ days }</span>
            </div>
        );
    }

    buildListView = () => {
        let { feed_list } = this.props;
        
        if (feed_list.length === 0) {
            return <Empty content="暂无内容"/>;
        }

        let formatted_data = {};
        feed_list[feed_list.length - 1].is_last = true;

        for (let i = 0; i < feed_list.length; i++) {
            let belong_date = feed_list[i].belong_date;

            if (!formatted_data[belong_date]) {
                formatted_data[belong_date] = [];
            }

            formatted_data[belong_date].push(feed_list[i]);
        }

        return (
            <CustomListView
                list_data={ formatted_data }
                has_more={ this.props.total_page > this.props.page ? true : false }
                onRenderRow={ this.buildListViewRow }
                onRenderSectionTitle={ this.buildSectionTitle }
                onLoad={ this.handleLoadData }/>
        );
    }

    handleCreateNew = () => {
        this.context.router.push('/create');
    }

    handleToMine = () => {
        this.context.router.push('/mine');
    }

    render() {
        return (
            <div>
                <NavBar
                    mode="light"
                    icon={ <Icon type="ellipsis" /> }
                    onLeftClick={ this.onOpenChange }
                    rightContent={[
                        <span key="bar_0" onClick={ this.handleCreateNew } style={{ fontSize: "24px" }}>+</span>
                    ]}
                >
                    Home
                </NavBar>
                <Drawer
                    className="my-drawer"
                    style={{ minHeight: document.documentElement.clientHeight - 95 }}
                    contentStyle={{ color: '#A6A6A6' }}
                    sidebar={ this.buildSideBar() }
                    open={ this.state.open }
                    onOpenChange={ this.onOpenChange }
                >
                    { this.buildListView() }
                </Drawer>
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
    ['home.index.feed_list', 'array', []],
    ['home.index.page', 'number', 1],
    ['home.index.birthday', 'string', ''],
    ['home.index.total_page', 'number', 0]
])(Home);