import React from 'react';
import ReactDOM from 'react-dom';
import createContainer from 'lib/createContainer';
import { Drawer, List, NavBar, Icon, Radio, ListView, Grid, Card } from 'antd-mobile';
import  ReactMarkdown from 'react-markdown';
import styles from './Article.css';
const input = '# 国宝级演员印度有阿米尔汗，英国有憨豆，中国谁能称为国宝演员？\n\n## 龙舌兰酒\n\n ![alt](https://r.sinaimg.cn/large/article/6188357d35055b4c99102f5873a4dd2d) \n\n ### 基本信息\n\n- 外文名：Tequila\n- 别名：特基拉酒\n- 颜色：金色、银色\n\n### 历史\n\n龙舌兰酒是墨西哥的国酒，被称为墨西哥的灵魂，是在墨西哥开奥运会，开始变得为世界所知\n\n### 原料\n\n以龙舌兰为原料经过蒸馏制作而成的一款蒸馏酒\n\n### 用途\n\n长用来当做基酒调制各种鸡尾酒，常见的包括特基拉日出、斗牛士、霜冻玛格丽特\n\n### 饮法\n\n#### 传统饮法\n\n墨西哥，传统的龙舌兰酒喝法十分特别，也颇需一番技巧。首先把盐巴撒在手背虎口上，用拇指和食指握一小杯纯龙舌兰酒，再用无名指和中指夹一片柠檬片。迅速舔一口虎口上的盐巴，接著把酒一饮而尽，再咬一口柠檬片，整个过程一气呵成，无论风味或是饮用技法，都堪称一绝。\n\n#### 常见饮法\n\n龙舌兰酒也适宜冰镇后纯饮，或是加冰块饮用。它特有的风味，更适合调制各种鸡尾酒。\n\n- 加7up，就是我们常听的 Teqila Pop用杯垫盖住酒杯用力敲下，再一饮而尽\n- 加柳橙汁还有红石榴糖浆(Grenadine)让红石榴沿杯口慢慢流下,形成很漂亮\n的色层，叫做Tequila Sunrise\n- 用小汤匙舀一勺未煮过的咖啡(磨成粉)..一口咖啡一口酒\n\n### 饮酒技巧\n\n龙舌兰酒纯饮，先将龙舌兰酒含在嘴里，待舌头微麻时，慢慢下咽，你会进入到一种忘我的境界，当然必须是墨西哥原装进口的100%agave的龙舌兰酒\n\n### 配套鸡尾酒\n\n#### 玛格丽特\n\n#### 地狱龙舌兰\n\n#### 龙舌兰日出\n\n## 莫吉托\n\n## 红岛冰茶';

class Article extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        }
    }

    handleBack = () => {
        this.context.router.goBack();
    }

    render() {
        return (
            <div className={ styles["article-page"] }>
                <NavBar
                    mode="light"
                    className={ styles["fixex_nav_bar"] }
                    icon={ <Icon type="left" /> }
                    onLeftClick={ this.handleBack }
                    rightContent={[
                        <Icon key="1" type="ellipsis" />
                    ]}
                >
                    文章
                </NavBar>
                <Card full style={{ padding: 0, border: "none", marginTop: "44px" }}>
                    <Card.Body style={{ padding: 0 }}>
                        <img style={{ width: "100%" }} src="https://wx4.sinaimg.cn/crop.0.0.550.309.1000/006DqfGBgy1fmqw7ksaglj30fa0bgaaf.jpg" /> 
                    </Card.Body>
                </Card>
                <Card style={{ border: "none", marginTop: '-3px' }}>
                    <Card.Body style={{ paddingTop: 0 }}>
                        <ReactMarkdown source={input} />
                    </Card.Body>
                    <Card.Footer extra="2017-12-25 12:33" />
                </Card>
            </div>
        );
    }
}

export default createContainer([
])(Article);