import React from 'react';
import ReactDOM from 'react-dom';
import createContainer from 'lib/createContainer';
import logo_img from 'statics/images/jian.png';
import { Button, WhiteSpace, List, InputItem, Flex, DatePicker, Toast } from 'antd-mobile';

const ERROR_TEXT_MAPPER = {
    user_id: "请输入用户名",
    password1: "请输入密码",
    password2: "请再次输入密码",
    invite_num: "请输入邀请码",
    birthday: "请选择出生日期"
};

class Signup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user_id: "",
            password1: "",
            password2: "",
            invite_num: "",
            birthday: getNowDate()
        }
    }

    componentWillReceiveProps = (next_props, props) => {
        if (next_props.msg !== '') {
            Toast.fail(next_props.msg, 2, () => {
                this.context.createAction("signup.index.setMsg", "");
            });
        }
    }

    handleInputChange = (type, val) => {
        this.setState({
            [type]: val
        });
    }

    checkAllRight = () => {
        for (var o in this.state) {
            if (this.state[o] === '') {
                return ERROR_TEXT_MAPPER[o];
            }
        }

        if (this.state.password1 !== this.state.password2) {
            return '两次输入密码不一致';
        }

        return false;
    }

    handleSignup = (e) => {
        let err_tip = this.checkAllRight();

        if (err_tip) {
            Toast.fail(err_tip);
            return;
        }

        this.context.createAction("signup.index.doSignup", {
            user_id: this.state.user_id,
            password: this.state.password1,
            invite_num: this.state.invite_num,
            birthday: this.state.birthday
        });
    }

    turnToSignin = (e) => {
        this.context.router.push('/');
    }

    handleDateChange = (date) => {
        this.setState({
            birthday: getNowDate(date)
        });
    }

    render() {
        return (
            <div>
                <div style={{ height: '300px', textAlign: "center" }}>
                    <img src={ logo_img } style={{ width: "100px", marginTop: "100px" }}/>
                </div>
                <List>
                    <InputItem
                        type="text"
                        placeholder="请输入用户名"
                        onChange={ this.handleInputChange.bind(this, 'user_id') }
                    >用户名</InputItem>
                    <InputItem
                        type="password"
                        placeholder="请输入密码"
                        onChange={ this.handleInputChange.bind(this, 'password1') }
                    >密码</InputItem>
                    <InputItem
                        type="password"
                        placeholder="请再次输入密码"
                        onChange={ this.handleInputChange.bind(this, 'password2') }
                    >确认密码</InputItem>
                    <InputItem
                        type="text"
                        placeholder="请输入邀请码"
                        onChange={ this.handleInputChange.bind(this, 'invite_num') }
                    >邀请码</InputItem>
                    <DatePicker
                        mode="date"
                        title="选择出生日期"
                        extra="请选择您的生日"
                        maxDate={ new Date(new Date().getTime() + 365 * 24 * 3600 * 1000) }
                        minDate={ new Date("1970-01-01") }
                        value={ new Date(this.state.birthday) }
                        onChange={ this.handleDateChange }
                    >
                        <List.Item arrow="horizontal">出生日期</List.Item>
                    </DatePicker>
                </List>
                <WhiteSpace />
                <WhiteSpace />
                <WhiteSpace />
                <Flex>
                    <Flex.Item>
                        <Button type="primary" onClick={ this.handleSignup }>确认</Button>
                    </Flex.Item>
                    <Flex.Item>
                        <Button onClick={ this.turnToSignin }>去登录</Button>
                    </Flex.Item>
                </Flex>
            </div>
        );
    }
}

export default createContainer([
    ['signup.index.msg', 'string', '']
])(Signup);

function getNowDate(target_date) {
    var now_date = target_date ? target_date : new Date();

    var y = now_date.getFullYear();
    var m = formatVal(now_date.getMonth() + 1);
    var d = formatVal(now_date.getDate());

    var h = formatVal(now_date.getHours());
    var M = formatVal(now_date.getMinutes());
    var s = formatVal(now_date.getSeconds());
    
    return y + '-' + m + '-' + d;
}

function formatVal(val) {
    val = val < 10 ? '0' + val : val;

    return val;
}