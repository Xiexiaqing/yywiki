import PropTypes from 'prop-types';
import React from 'react';
import CSSModules from 'react-css-modules';
import getPosition from 'utils/dom/position';
import getSize from 'utils/dom/dom/getSize';
import utils from './utils';
import styles from './Cal.css';

import Modal from '../Modal/Modal';
import Item from './Item';
import Time from './Time';

@CSSModules(styles, { allowMultiple: true })
export default class Cal extends React.Component {
    constructor(props, context) {
        super(props, context);

        let tempValue = props.targetNode.value;
        let tempSdate = null;
        let tempEdate = null;

        if (props.range) {
            let _times = (tempValue || '').split('~');
            tempSdate= utils.format(_times[0] || '');
            tempEdate = utils.format(_times[1] || '');
        } else {
            tempSdate = utils.format(tempValue);
            tempEdate = null;
        }

        let timeline = utils.calcTimeline(props.sdate, props.edate, props.longs);

        this.state = {
            show: props.show,
            showType: 'day',
            chooseSdate: tempSdate,
            chooseEdate: tempEdate,
            hour: tempSdate.hour,
            min: tempSdate.min,
            sec: tempSdate.sec,
            showYear: tempSdate.year,
            showMonth: tempSdate.month,
            titleText: tempSdate.year + '年' + tempSdate.month + '月',
            dayList: utils.resetDayList(tempSdate.year, tempSdate.month, timeline),
            monthList: [],
            yearList: [],
            timeline: timeline,
            time: this.props.range ? false : this.props.time
        };
    }

    static propTypes = {
        targetNode: PropTypes.object.isRequired,
        onShow: PropTypes.func,
        onHide: PropTypes.func,
        onChoose: PropTypes.func,
        hideWhenMaskClick: PropTypes.bool,
        show: PropTypes.bool,

        range: PropTypes.bool,
        time: PropTypes.bool,
        sdate: PropTypes.string,
        edate: PropTypes.string,
        longs: PropTypes.number
    }

    static defaultProps = {
        onHide: () => null,
        onShow: () => null,
        onChoose: () => null,
        hideWhenMaskClick: true,
        sdate: '',
        edate: '',
        longs: '',
        range: false,
        time: false,
        show: false
    }

    componentWillReceiveProps = (nextProps) => {
        this.setState({ show: nextProps.show });
    }

    entered = () => {
        this.props.onShow();
    }

    exited = () => {
        this.props.onHide();
    }

    handleMaskClick = () => {
        if (!this.props.hideWhenMaskClick) return;
        this.setState({ show: false });
    }

    handleTurnPage = (type) => {
        let { showYear, showMonth, timeline } = this.state;

        if (this.state.showType === 'day') {
            if (type === 'left' || type === 'right') {
                showMonth = parseInt(showMonth) + ( type === 'left' ? -1 : 1 );
                showYear = showMonth > 12 ? parseInt(showYear) + 1 : showYear;
                showYear = showMonth < 1 ? parseInt(showYear) - 1 : showYear;
                showMonth = showMonth > 12 ? 1 : showMonth;
                showMonth = showMonth < 1 ? 12 : showMonth;
                showMonth = showMonth < 10 ? '0' + showMonth : showMonth;

                this.setState({
                    showMonth,
                    showYear,
                    titleText: showYear + '年' + showMonth + '月',
                    dayList: utils.resetDayList(showYear, showMonth, timeline)
                });
            } else {
                this.setState({
                    showType: 'month',
                    monthList: utils.resetMonthList(showYear, timeline),
                    titleText: showYear + '年',
                    time: false
                });
            }
        } else if (this.state.showType === 'month') {
            if (type === 'left' || type === 'right') {
                showYear = parseInt(showYear) + ( type === 'left' ? -1 : 1 );

                this.setState({
                    showYear,
                    titleText: showYear + '年',
                    monthList: utils.resetMonthList(showYear, timeline)
                });
            } else {
                this.setState({
                    showType: 'year',
                    yearList: utils.resetYearList(showYear, timeline),
                    titleText: (showYear - 6) + '-' + (showYear + 5) + '年',
                    time: false
                });
            }
        } else if (this.state.showType === 'year') {
            if (type === 'left' || type === 'right') {
                showYear = parseInt(showYear) + ( type === 'left' ? -12 : 12 );

                this.setState({
                    showYear,
                    titleText: (showYear - 6) + '-' + (showYear + 5) + '年',
                    yearList: utils.resetYearList(showYear, timeline)
                });
            }
        }
    }

    handleItemClick = (type, content) => {
        this[type + 'ItemChoose'](content);
    }

    dayItemChoose = (day) => {
        let { showYear, showMonth, chooseSdate, chooseEdate } = this.state;
        let tempDate = utils.format(showYear + '-' + showMonth + '-' + day);

        if (!this.props.range || (!chooseSdate || chooseEdate)) {
            this.setState({
                chooseSdate: tempDate,
                chooseEdate: null
            });

            !this.state.time && this.finish(tempDate, null);

            return;
        }

        chooseEdate = tempDate;

        if(chooseSdate.getTime > tempDate.getTime) {
            chooseEdate = chooseSdate
            chooseSdate = tempDate;
        }

        this.setState({
            chooseSdate: chooseSdate,
            chooseEdate: chooseEdate
        });

        !this.state.time && this.finish(chooseSdate, chooseEdate);
    }

    monthItemChoose = (month) => {
        let { showYear, timeline } = this.state;
        month = month < 10 ? '0' + month : month;

        this.setState({
            showMonth: month,
            titleText: showYear + '年' + month + '月',
            dayList: utils.resetDayList(showYear, month, timeline),
            showType: 'day',
            time: this.props.range ? false : this.props.time
        });
    }

    yearItemChoose = (year) => {
        let { timeline } = this.state;

        this.setState({
            showYear: year,
            titleText: year + '年',
            monthList: utils.resetMonthList(year, timeline),
            showType: 'month',
            time: false
        });
    }

    itemBuild = (type) => {
        return this.state[type + 'List'].map((item, i) => {
            item.content = item[type];

            let belongOpts = [];
            belongOpts[3] = { s: this.state.chooseSdate, e: this.state.chooseEdate || this.state.chooseSdate };
            belongOpts[0] = type === 'year' ? item.content : this.state.showYear;
            belongOpts[1] = type === 'month' ? item.content : (type === 'year' ? null : this.state.showMonth);
            belongOpts[2] = type === 'day' ? item.content : null;

            let tempClass = utils.belong.apply(utils, belongOpts) ? styles[type] : '';

            return (
                <Item
                    data={ item }
                    key={ i }
                    onChoose={ this.handleItemClick.bind(this, type) }
                    itemClass={ tempClass } />
            );
        });
    }

    finish = (sdate, edate, timeData) => {
        let _val = sdate.date;
        let { hour, min, sec } = timeData || this.state;

        if(this.state.time && !this.props.range){
            _val += ' ' + (utils.doubles(Number(hour))||'00') + ':' + (utils.doubles(Number(min))||'00') + ':' + (utils.doubles(Number(sec))||'00');
        }

        if(this.props.range && !edate) { return; }

        this.props.range && (_val = sdate.date + ' ~ ' + edate.date);
        this.props.targetNode.value = _val;
        this.props.onChoose({ value: _val });
        this.setState({ show: false });
    }

    handleTimeSave = (timeData) => {
        let { hour, min, sec } = timeData;
        let { chooseSdate, chooseEdate } = this.state;

        hour = hour ? hour : '00';
        min = min ? min : '00';
        sec = sec ? sec : '00';

        this.setState({ hour, min, sec });
        this.finish(chooseSdate, chooseEdate, timeData);
    }

    buildTimeZone = () => {
        if (!this.state.time) return null;

        return (
            <Time
                hour={ this.state.hour }
                min={ this.state.min }
                sec={ this.state.sec }
                styles={ styles }
                onSave={ this.handleTimeSave }/>
        );
    }

    getBodyContent = () => {
        const { showType } = this.state;

        return (
            <div className={ styles[showType + '_list']}>
                {
                    showType === 'day' ? (
                        <ul className={ styles["weeks"] }>
                            <li>一</li>
                            <li>二</li>
                            <li>三</li>
                            <li>四</li>
                            <li>五</li>
                            <li>六</li>
                            <li>日</li>
                        </ul>
                    ) : null
                }
                <ul className={ styles[showType + 's'] }>
                    { this.itemBuild(showType) }
                </ul>
            </div>
        );
    }

    render() {
        let targetSize = getSize(this.props.targetNode);
        let targetPos = getPosition(this.props.targetNode);

        return (
            <Modal
                show={ this.state.show }
                transition={ false }
                onShow={ this.entered }
                onHide={ this.exited }
                pos={{ l: targetPos.l, t: targetPos.t + targetSize.height}}
                withMask={ true }
                onMaskClick={ this.handleMaskClick }
            >
                <div styleName="layer_calendar">
                    <div styleName="selector">
                        <a href="javascript:void(0)" onClick={ this.handleTurnPage.bind(this, 'left') } styleName="W_ficon ficon_arrow_left">b</a>
                        <a href="javascript:void(0)" onClick={ this.handleTurnPage.bind(this, 'right') } styleName="W_ficon ficon_arrow_right">a</a>
                        <a href="javascript:void(0)" onClick={ this.handleTurnPage.bind(this, 'center') } styleName="quick_select">
                            { this.state.titleText }
                        </a>
                    </div>
                    <div>
                        { this.getBodyContent() }
                    </div>
                    <div>
                        { this.buildTimeZone() }
                    </div>
                </div>
            </Modal>
        );
    }
}
