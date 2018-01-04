import React from 'react';
import ReactDOM from 'react-dom';
import createContainer from 'lib/createContainer';
import logo_img from 'statics/images/jian.png';
import { Button, WhiteSpace, List, InputItem, Flex, Toast } from 'antd-mobile';

class Signin extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            password: "",
            user_id: ""
        }
    }

    componentWillReceiveProps = (next_props, props) => {
        if (next_props.msg !== '') {
            Toast.fail(next_props.msg, 2, () => {
                this.context.createAction("signin.index.setMsg", "");
            });
        }
    }

    componentDidMount = () => {
        let token = window.localStorage.getItem('jwt_token') || '';
    
        if (token) {
            this.context.router.push('/home');
        }
    }

    handleInputChange = (type, val) => {
        this.setState({
            [type]: val
        });
    }

    handleSignin = (e) => {
        if (this.state.user_id === '') {
            Toast.fail('请输入用户名');
            return;
        }

        if (this.state.password === '') {
            Toast.fail('请输入密码');
            return;
        }

        this.context.createAction("signin.index.doSignin", {
            user_id: this.state.user_id,
            password: this.state.password
        });
    }

    turnToSignup = (e) => {
        this.context.router.push('/signup');
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
                        onChange={ this.handleInputChange.bind(this, 'password') }
                    >密码</InputItem>
                </List>
                <WhiteSpace />
                <WhiteSpace />
                <WhiteSpace />
                <Flex>
                    <Flex.Item>
                        <Button type="primary" onClick={ this.handleSignin }>登录</Button>
                    </Flex.Item>
                    <Flex.Item>
                        <Button onClick={ this.turnToSignup }>注册</Button>
                    </Flex.Item>
                </Flex>
            </div>
        );
    }
}

export default createContainer([
    ['signin.index.msg', 'string', '']
])(Signin);