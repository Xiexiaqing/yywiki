import styles from './ScrollSelect.css';
import Selector from './Selector';
import Modal from '../Modal/Modal';
import { isSame } from '../../utils/differ';

import PropTypes from 'prop-types';

import React from 'react';
import CSSModules from 'react-css-modules';

@CSSModules(styles)
export default class ScrollSelect extends React.Component {
    static propTypes = {
        selectData: PropTypes.object, // 选择数据
        initial: PropTypes.object, // 初始数据
        onSelect: PropTypes.func, // 下拉刷新回调
        show: PropTypes.bool, // 展示 or 隐藏组件
        onMaskClick: PropTypes.func, // 点击蒙层
        onEscapeKeyUp: PropTypes.func, // 按ESC键的回调
        selectSt: PropTypes.object //滚轮选择器li容器样式
    }

    static defaultProps = {
        onSelect: function() {},
        onMaskClick: function() {},
        onEscapeKeyUp: function() {}
    };

    state = {
        inited: false,
        contents: [],
        initIndex: [],
        select: [],
        offset: 0,
        itemSize: 0,
        blankNum: 0
    }

    componentWillMount = () => {
        this.setSelectorGlobalKeys(this.props.selectData);
    }

    componentDidMount = () => {
        if (this.state.inited || !this.props.show) return;
        this.getItemSize();
        this.setInitialContent();
        this.setState({ inited: true });
    }

    componentWillReceiveProps = nextProps => {
        if (!isSame(this.props.selectData, nextProps)) {
            this.setSelectorGlobalKeys(nextProps.selectData);
            this.setState({ inited: false });
        }
    }

    componentDidUpdate = () => {
        if (this.state.inited || !this.props.show) return;
        if (this.state.itemSize === 0) {
            this.getItemSize();
        }
        this.setInitialContent();
        this.setState({ inited: true });
    }

    getItemSize = () => {
        let { wrapper, scroller } = this.refs;
        let itemSize, wrapperSize;
        if (this.props.startX) {
            itemSize = Math.round(scroller.getBoundingClientRect().width);
            wrapperSize = Math.round(wrapper.getBoundingClientRect().width);
        } else {
            itemSize = Math.round(scroller.getBoundingClientRect().height);
            wrapperSize = Math.round(wrapper.getBoundingClientRect().height);
        }
        let blankNum = parseInt(wrapperSize / 2 / itemSize);

        this.setState({
            offset: wrapperSize / 2 - itemSize * blankNum - itemSize / 2,
            itemSize, blankNum
        });
    }

    setSelectorGlobalKeys = (data) => {
        var keys = [];
        Object.keys(data).forEach(k => keys.push(k));
        this.setState({ keys });
    }

    setInitialContent = () => {
        var keys = this.state.keys;
        var initial = this.props.initial;
        var contents = [];
        var initIndex = [];
        var legal = initial && keys.every((key, i) => {
            let father = initial[keys[i - 1]];
            let dataList = this.getChildData(key, father);
            let curIndex = this.getIndexOf(dataList, initial[key]);
            contents.push(dataList);
            initIndex.push(curIndex);
            return curIndex >= 0;
        });

        if (legal) {
            this.setState({ contents, select: initIndex });
        } else {
            if (initial) {
                console.error('initial value error, please check your "selectData" and "initial"');
            }

            let length = keys.length;
            var select = [];
            keys.forEach((key, i) => {
                let fatherSelect = i > 0 ? contents[i - 1][select[i - 1]] : undefined;
                contents[i] = this.getChildData(key, fatherSelect && fatherSelect.value);
                select[i] = this.getIndexOf(contents[i], contents[i][0].value);
            });
            this.setState({ contents, select });
        }
    }

    setSelectorValue = (key, list, index) => {
        // select 相等直接返回
        let { keys, select, contents } = this.state;
        let length = keys.length;
        let idx = keys.indexOf(key);

        if (select[idx] === index) return;
        select[idx] = index;
        for (let i = idx + 1; i < length; i++) {
            let next = keys[i];
            let fatherSelect = contents[i - 1][select[i - 1]];
            contents[i] = this.getChildData(next, fatherSelect.value);
            if (!this.isLinkage(key)) {
                select[i] = this.getIndexOf(contents[i], contents[i][0].value);
            }
        }

        this.setState({ contents, select });
    }

    isLinkage = function(key) {
        return Array.isArray(this.props.selectData[key]);
    }

    getChildData = function(key, father) {
        let data = this.props.selectData;
        if (this.isLinkage(key)) {
            return data[key];
        }
        if (!data[key][father])
            data[key][father] = [{value:'', text: ''}];
        
        return data[key][father];
    }

    getIndexOf = function(dataList, cur) {
        for (var i = 0, l = dataList.length; i < l; i++) {
            if (dataList[i]['value'] === cur) return i;
        }
        return -1;
    }

    getSelectorContent = () => {
        if (!this.props.show) return null;
        if (!this.state.inited) {
            return (
                <div styleName="content" style={ { width: '93%' } } ref="wrapper">
                    <ul ref="scroller">
                        <li>&nbsp;</li>
                    </ul>
                </div>
            );
        }
        let keys = this.state.keys;
        let contentWidth = Math.floor((100 - 7) / keys.length) + "%";
        var children = [];

        return keys.map((v, i) => (
            <Selector
                style={ { width: contentWidth } } 
                key={ i }
                selectKey={ v }
                selectSt={this.props.selectSt}
                contents={ this.state.contents[i] } 
                select={ this.state.select[i] }
                setValue={ this.setSelectorValue }
                blankNum={ this.state.blankNum } 
                itemSize={ this.state.itemSize }
                offset={ this.state.offset } />
        ));
    }

    handleClick = e => {
        var result = {};
        var { keys, contents } = this.state;
        this.state.select.forEach((index, i) => {
            result[keys[i]] = contents[i][index]
        })
        this.props.onSelect(result);
    }

    render() {
        return (
            <Modal
                withMask={ true }
                show={ this.props.show }
                onMaskClick={ this.props.onMaskClick }
                onEscapeKeyUp={ this.props.onEscapeKeyUp }
            >
                <div styleName="select_scroll">
                    <div styleName="header">
                        <a href="javascript:void(0)" onClick={ this.handleClick }>完成</a>
                    </div>
                    <div styleName="main">
                        { this.getSelectorContent() }
                    </div>
                </div>
            </Modal>
        );
    }
}
