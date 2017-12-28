import PropTypes from 'prop-types';
import React from 'react';
import getUniqueKey from '../../utils/uniqueKey';
import { initLine } from '../../utils/raphael/index';
import SceneChange from '../SceneChange/SceneChange';

export default class Chart extends React.Component {
    static propTypes = {
        chartsdata: PropTypes.object,
        type: PropTypes.string,
        className: PropTypes.string,
        style: PropTypes.object,
        opts: PropTypes.object
    };

    static defaultProps = {
        type: 'line',
        opts: {}
    };

    state = {
        chartid: 'id' + getUniqueKey()
    };

    componentDidMount = () => {
        let { type, chartsdata } = this.props;
        this.doRender(type, chartsdata);
    }

    componentDidUpdate = () => {
        let { type, chartsdata } = this.props;
        this.doRender(type, chartsdata);
    }

    doRender = (type, chartsdata) => {
        if (!chartsdata) return;
        
        let chartWrap = this.refs[this.state.chartid];

        if (type === 'line') {
            initLine(chartsdata, chartWrap, this.props.opts);
        }
    }

    render() {
        let temp = null;
        if (!this.props.chartsdata) {
            temp = <SceneChange />;
        }
        return (
            <div className={ this.props.className } ref={ this.state.chartid } style={ this.props.style }>
                { temp }
            </div>
        );
    }
}