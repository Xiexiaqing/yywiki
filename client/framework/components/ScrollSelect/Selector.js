import styles from './Selector.css';
import Scroll from '../Scroll/decorator';
import { isSame } from '../../utils/differ';

import PropTypes from 'prop-types';

import React from 'react';
import CSSModules from 'react-css-modules';

@Scroll()
@CSSModules(styles)
export default class Selector extends React.Component {
    static propTypes = {
        key: PropTypes.string, // 当前列key
        itemSize: PropTypes.number, // 每项高度
        contents: PropTypes.array, // select数据集合
        select: PropTypes.number, // 初始数据索引
        blankNum: PropTypes.number, // 占位空白item数
        offset: PropTypes.number, // 内部scroll偏移量
        scrollTo: PropTypes.func, // scroll滑动函数
        setValue: PropTypes.func, // 选中回调
        selectSt: PropTypes.object, //滚轮选择器li容器样式

        easeDuration: PropTypes.number, // 滑动持续时间
        easeFunc: PropTypes.string // 滑动timing function
    }

    static defaultProps = {
        onSelect: function() {},
        easeDuration: 600,
        easeFunc: 'cubic-bezier(0.1, 0.57, 0.1, 1)'
    };

    constructor(props) {
        super(props);
        this.props.setScrollCallback({
            setResetPosition: this.resetPos,
            onScrollInit: () => this.scrollToOptions(this.props.select)
        });
    }

    componentDidMount = () => {
        
    }

    componentDidUpdate = (prevProps) => {
        this.scrollToOptions(this.props.select);
    }

    shouldComponentUpdate = (nextProps, nextState) => {
        if (this.props.select === nextProps.select && 
            isSame(this.props.contents, nextProps.contents)) {
            return false;
        }
        return true;
    }

    scrollToOptions = (index) => {
        let { 
            itemSize, offset, scrollTo, 
            easeDuration, easeFunc 
        } = this.props;

        let { 
            scrollX, scrollY
        } = this.props.getComputedState();

        if (index < 0) return;
        if (scrollX) {
            scrollTo(-index * itemSize + offset, 0, easeDuration, easeFunc);
        }
        if (scrollY) {
            scrollTo(0, -index * itemSize + offset, easeDuration, easeFunc);
        }    
    }

    resetPos = (time, ease) => {
        let { 
            x, y, topScrollX, topScrollY, bottomScrollX, bottomScrollY,
            hasVerticalScroll, 
            hasHorizontalScroll 
        } = this.props.getComputedState();
        let oldx = x;
        let oldy = y;
        let {
            selectKey, itemSize, contents, offset,
            scrollTo, setValue, blankNum,
            easeDuration, easeFunc
        } = this.props;

        var count, selectKeyIndex;
        if (!hasVerticalScroll) {
            // if we are out of bound, reset position
            if (x > topScrollX) {
                x = topScrollX;
            } else if (x < bottomScrollX) {
                x = bottomScrollX;
            }
            count = x / itemSize;
            selectKeyIndex = Math.round(count);
            selectKeyIndex = Math.abs(count - selectKeyIndex) > 0.5 ? 
                    selectKeyIndex + 1 : selectKeyIndex;
            selectKeyIndex = selectKeyIndex < 0 - contents.length + 1 ? 
                    0 - contents.length + 1: selectKeyIndex;
            x = selectKeyIndex * itemSize + offset;
            y = 0;
        }
            
        if (!hasHorizontalScroll) {
            // if we are out of bound, reset position
            if (y > topScrollY) {
                y = topScrollY;
            } else if (y < bottomScrollY) {
                y = bottomScrollY;
            }
            count = y / itemSize;
            selectKeyIndex = Math.round(count);
            selectKeyIndex = Math.abs(count - selectKeyIndex) > 0.5 ? 
                    selectKeyIndex + 1 : selectKeyIndex;
            selectKeyIndex = selectKeyIndex < 0 - contents.length + 1 ? 
                    0 - contents.length + 1: selectKeyIndex;
            x = 0;
            y = selectKeyIndex * itemSize + offset;
        }

        setValue(selectKey, contents, 0 - selectKeyIndex);

        if (x == oldx && y == oldy) return false;
        scrollTo(x, y, easeDuration, easeFunc);
    }

    getContent = () => {
        var res = [];
        let { blankNum, contents } = this.props;
        let key = 0;
        for (let i = 0; i < blankNum; i++) {
            res.push(<li key={ key++ }>&nbsp;</li>);
        }
        contents.forEach((val, i) => {
            res.push(<li key={ key++ } style={this.props.selectSt} selectVal={ val.value }>{ val.text }</li>);
        });
        for (let i = 0; i < blankNum; i++) {
            res.push(<li key={ key++ }>&nbsp;</li>);
        }
        return res;
    }

    render() {
        let { setValue, ...others } = this.props;
        return (
            <div styleName="content" { ...others }>
                <ul>
                    { this.getContent() }
                </ul>
            </div>
        );
    }
}

