import React from 'react';
import ReactDOM from 'react-dom';
import createContainer from 'lib/createContainer';
import { TabBar, NavBar, Button, WhiteSpace, List, Picker, Toast, InputItem } from 'antd-mobile';

class Mine extends React.Component {
    constructor(props) {
        super(props);

        let user_list = window.localStorage.getItem('user_list');
        let user_id = window.localStorage.getItem('user_id');
        let user_obj = {};
        let res_arr = [
            {
                label: "添加一个账号",
                value: "-1"
            }
        ];

        if (user_list) {
            user_obj = JSON.parse(user_list);
        }

        for (let o in user_obj) {
            if (o !== user_id) {
                res_arr.push({
                    label: o,
                    value: user_obj[o]
                });
            }
        }

        this.state = {
            user_list: res_arr,
            selected_user: "new_one_20160818"
        };
    }

    componentWillReceiveProps = (next_props, props) => {
        if (next_props.msg !== '') {
            Toast.fail(next_props.msg, 2, () => {
                this.context.createAction("mine.index.setMsg", "");
            });
        }
    }

    handleToHome = () => {
        this.context.router.push('/home');
    }

    handleLogout = () => {
        let user_id = window.localStorage.getItem('user_id');
        window.localStorage.removeItem('jwt_token');
        window.localStorage.removeItem('user_id');
        
        let user_list = window.localStorage.getItem('user_list');
        let user_obj = {};

        if (user_list) {
            user_obj = JSON.parse(user_list);
        }
        
        delete user_obj[user_id];
        window.localStorage.setItem('user_list', JSON.stringify(user_obj));

        this.context.router.push('/signin');
    }

    handleChangeUser = (val) => {
        let token = val[0];

        if (token === '-1') {
            window.localStorage.removeItem('jwt_token');
            window.localStorage.removeItem('user_id');
            this.context.router.push('/signin');
        } else {
            let user_id = '';
            for (let i = 0; i < this.state.user_list.length; i++) {
                if (this.state.user_list[i].value === val) {
                    user_id = this.state.user_list[i].label;
                    break;
                }
            }
            this.context.createAction("mine.index.doCheck", token, user_id);
        }
    }

    render() {
        return (
            <div>
                <NavBar
                    mode="light"
                    icon={ null }
                    onLeftClick={ null }
                >
                    我
                </NavBar>
                <div style={{ minHeight: document.documentElement.clientHeight - 95 }} >
                    <WhiteSpace />
                    <List>
                        <InputItem
                            type="text"
                            editable={ false }
                            value={ this.props.user_id }
                        >用户名</InputItem>
                        <InputItem
                            type="text"
                            editable={ false }
                            value={ this.props.birthday }
                        >生日</InputItem>
                        <InputItem
                            type="text"
                            editable={ false }
                            value={ this.props.feed_count }
                        >发博总量</InputItem>
                    </List>
                    <WhiteSpace />
                    <List className="date-picker-list" style={{ backgroundColor: 'white' }}>
                        <List.Item key="pswd" arrow="horizontal">修改密码</List.Item>
                        <Picker
                            data={ this.state.user_list }
                            cols={ 1 }
                            title="选择账号"
                            onOk={ this.handleChangeUser }
                        >
                            <List.Item key="changeuser" arrow="horizontal">切换账号</List.Item>
                        </Picker>
                    </List>
                    <WhiteSpace />
                    <Button onClick={ this.handleLogout }>退出</Button>
                </div>
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
                        selected={ true }
                        onPress={ null } />
                </TabBar>
            </div>
        );
    }
}

export default createContainer([
    ['mine.index.msg', 'string', ''],
    ['mine.index.birthday', 'string', ''],
    ['mine.index.user_id', 'string', ''],
    ['mine.index.feed_count', 'number', 0]
])(Mine);