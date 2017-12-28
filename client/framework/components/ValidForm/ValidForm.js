import PropTypes from 'prop-types';
/* global arguments: false */
/* eslint-env browser */
import React, { Children } from 'react';
import rules from './rules';
import { arraysDiffer } from '../../utils/differ';
import chainFunction from '../../utils/chainFunction';
import recursivelyCloneChildren from '../../utils/recursivelyCloneChildren';
import traverseAllChildren from '../../utils/traverseAllChildren';

export default class ValidForm extends React.Component {
    static propTypes = {
        trigger: PropTypes.string, // 检查触发的事件
        onValidation: PropTypes.func, // 每次检查完的回调，目前有四个参数(数值, 是否原值, 错误提示, 正确提示)
        registerSubmit: PropTypes.func // 注册submit事件
    }

    static defaultProps = {
        trigger: 'onChange',
        onValidation: function() {},
        registerSubmit: function() {}
    };

    // 注册需要验证的input
    componentWillMount = () => {
        this.inputs = this.getInputComponents();
        this.validations = {};
        this.messages = {};
        this.initValidators();
    }

    componentDidMount = () => {
        // this.validateForm();
        setTimeout(() => {
            this.initValidators(this.validateForm);
        }, 1000);
    }

    componentWillUpdate = () => {
        this.prevInputKeys = Object.keys(this.inputs);
    }

    componentDidUpdate = () => {
        this.inputs = this.getInputComponents();
        if (arraysDiffer(this.prevInputKeys, Object.keys(this.inputs))) {
            this.initValidators(this.validateForm);
        }
    }

    state = {
        values: {},
        messages: {},
        pristines: {}
    }

    getInputComponents = () => {
        var inputs = {};
        traverseAllChildren(this.props.children, child => {
            if (child && (child.type === 'input' || child.type === 'textarea') && child.props.type !== 'radio' && child.props.type !== 'file') {
                let { name, value } = child.props;
                if (inputs[name]) {
                    console.error("inputs have the same name");
                }
                inputs[name] = child;
            }
        });
        return inputs;
    }

    initValidators = callback => {
        var inputs = this.inputs;
        let inputKeys = Object.keys(inputs);
        var stateValues = {};
        var statePristines = {};
        var stateMessages = {};
        Object.keys(inputs).forEach(name => {
            let { 
                rules, errors, success, infos, value,
                type, checked
            } = inputs[name].props;
            this.validations[name] = rules || [];
            this.messages[name] = [];
            this.messages[name][0] = errors || [true];
            this.messages[name][1] = success || [true];
            this.messages[name][2] = infos || [true];
            stateValues[name] = type === "checkbox" ? (checked || false) : value;
            statePristines[name] = true;
            stateMessages[name] = [false, true, true];
        });
        this.setState({ 
            values: stateValues, 
            messages: stateMessages, 
            pristines: statePristines
        }, callback);
        this.rules = Object.assign(rules, this.props.rules);
        this.props.registerSubmit(this.doSubmit);
    };

    onInputChange = e => {
        if (e.target.getAttribute('off')) return;
        
        let { name, value, type, checked } = e.target;
        let { values, pristines } = this.state;
        values[name] = type === "checkbox" ? checked : value;
        if (pristines[name]) {
            pristines[name] = false;
            this.setState({ values, pristines });
            return;
        }
        this.setState({ values });
    }

    runValidation = e => {
        if (e.target.getAttribute('off')) return;

        let { name, value, type, checked } = e.target;
        this.validate(name, type === "checkbox" ? checked : value);
    }

    validate = (key, val) => {
        var validations = this.validations[key];
        let validateKeys = Object.keys(validations);
        var { messages } = this.state;
        validateKeys.every ((valid, i) => {
            let validation = validations[valid];
            let args = validation.split(":");
            let rule = args.shift();
            if (this.rules[rule] && this.rules[rule](val, ...args)) {
                messages[key][0] = this.messages[key][0][i] ? 
                        this.messages[key][0][i] : 
                        this.messages[key][0][this.messages[key][0].length - 1];
                messages[key][1] = false;
                return false;
            }
            messages[key][0] = false;
            messages[key][1] = this.messages[key][1] ? 
                    this.messages[key][1] : true;
            return true;
        });
        this.setState({ messages }, this.props.onValidation( 
            this.getCurrentValues(), this.state.messages,
            this.state.pristines, this.state.values
        ));
    }

    getCurrentValues = () => {
        return this.isValid() ? this.state.values : false;
    }

    doSubmit = () => {
        // doing submit will turn all inputs value not pristine
        var inputs = this.inputs;
        var hasPristined = false;
        var { pristines } = this.state;
        let inputKeys = Object.keys(inputs);
        inputKeys.forEach(name => {
            if (pristines[name] === true) {
                pristines[name] = false;
                hasPristined = true;
            }
        });
        if (hasPristined) {
            this.setState({ pristines });
        }
        // because we have verify the form before, so there is no need to do
        // the validation here.
        var { messages } = this.state;
        Object.keys(messages).some(name => {
            if (messages[name][0]) {
                document.querySelector('input[name=' + name + ']').focus();
                return true;
            }
        });

        return this.getCurrentValues();
    }

    validateForm = () => {
        let inputs = this.inputs;
        let inputKeys = Object.keys(inputs);

        // 检查所有的自组件
        Object.keys(inputs).forEach((name, index) => {
            if (inputs[name].props.off) return;

            let val = this.state.values[name];
            this.validate(name, val);
        });
    }

    isValid = () => {
        var { messages } = this.state;
        let keys = Object.keys(messages);
        return keys.every(name => messages[name][1]);
    }

    // we have to clone all children to change input's props;
    attachValidators = children => {
        return recursivelyCloneChildren(children, child => {
            if ((child.type === 'input' || child.type === 'textarea') && child.props.type !== 'radio' && child.props.type !== 'file') {
                const extraProps = {};
                const trigger = this.props.trigger;
                extraProps.value = this.state.values[child.props.name];
                if (trigger === 'onChange') {
                    extraProps.onChange = chainFunction(child.props.onChange,
                            this.onInputChange, this.runValidation);
                } else {
                    extraProps.onChange = chainFunction(child.props.onChange,
                            this.onInputChange, this.runValidation);
                    extraProps[trigger] = chainFunction(child.props[trigger],
                            this.onInputChange, this.runValidation);
                }
                return extraProps;
            }
            return false;
        });
    };

    render() {
        return (
            <div>
                { this.attachValidators(this.props.children) }
            </div>
        );
    }
}
 