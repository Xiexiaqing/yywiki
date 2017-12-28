import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class Time extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            hour: props.hour,
            min: props.min,
            sec: props.sec
        };
    }

    static propTypes = {
        hour: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        min: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        sec: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        styles: PropTypes.object.isRequired,
        onSave: PropTypes.func
    }

    static defaultProps = {
        onSave: () => null
    }

    handleInputChange = (type, e) => {
        let _max = type === 'hour' ? 23 : 59;
        let _val = e.target.value;
        _val = _val.replace(/\D/g, '');
        _val = parseInt(_val) > _max ? _max : _val;
        _val = parseInt(_val) < 0 ? '00' : _val;

        this.setState({
            [type]: _val
        });
    }

    handleSubmit = () => {
        this.props.onSave(this.state);
    }

    render() {
        const { styles } = this.props;

        return (
            <div className={ styles["day_list"] }>
                <div className={ styles["times"] + " " + styles["clearfix"] }>
                    <div className={ styles["input_area"] } style={{ textAlign: "center" }} >
                        <input
                            maxLength="2"
                            className={ styles["time_input"] }
                            type="text"
                            value={ this.state.hour }
                            onChange={ this.handleInputChange.bind(this, 'hour')} />
                        :
                        <input
                            maxLength="2"
                            className={ styles["time_input"] }
                            type="text"
                            value={ this.state.min }
                            onChange={ this.handleInputChange.bind(this, 'min')}/>
                        :
                        <input
                            maxLength="2"
                            className={ styles["time_input"] }
                            type="text"
                            value={ this.state.sec }
                            onChange={ this.handleInputChange.bind(this, 'sec')}/>
                    </div>
                    <a
                        href="javascript:void(0)"
                        className={ styles["time_btn"] }
                        onClick={ this.handleSubmit }>确定</a>
                </div>
            </div>
        );
    }
}
