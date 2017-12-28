import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import Simditor from './plugins/simditor';
import './plugins/statics/simditor.css';

export default class RichEditor extends React.Component {
    static propTypes = {
        content: PropTypes.string,
        className: PropTypes.string,
        uploadUrl: PropTypes.string,
        uploadParams: PropTypes.object,
        toolbar: PropTypes.array,
        handleChange: PropTypes.func,
        handleFocus: PropTypes.func,
        handleBlur: PropTypes.func
    }

    static defaultProps = {
        content: '',
        className: '',
        toolbar: [
            'title',
            'bold',
            'italic',
            'underline',
            'strikethrough',
            'fontScale',
            'color',
            'ol',
            'ul',
            'blockquote',
            'code',
            'table',
            'link',
            'image',
            'hr',
            'indent',
            'outdent',
            'alignment'
        ],
        handleChange: () => null,
        handleFocus: () => null,
        handleBlur: () => null
    }

    state = {
    }

    componentDidMount =  () => {
        let textbox = ReactDOM.findDOMNode(this.refs.textZone);
        let opts = {
            textarea: textbox,
            toolbar: this.props.toolbar,
            upload: false,
            imageButton: 'upload'
        };

        if (this.props.uploadUrl) {
            opts.upload = {};
            opts.upload = {
                url: this.props.uploadUrl,
                params: this.props.uploadParams,
                connectionCount: 1
            };
        }

        this.editor = new Simditor(opts);
        this.editor.setValue(this.props.content);

        this.bindAllEvents();
    }

    componentWillReceiveProps = (nextProps) => {
        if (nextProps.content !== this.props.content) {
            this.editor.setValue(nextProps.content);
        }
    }

    handleChange = (e, src) => {
        //增加编辑器文本传参
        this.props.handleChange(this.editor.getValue(), this.editor.body.text());
    }

    handleFocus = (e, src) => {
        this.props.handleFocus();
    }

    handleBlur = (e, src) => {
        this.props.handleBlur();
    }

    bindAllEvents = () => {
        if (!this.editor) return;

        this.editor.on('valuechanged', this.handleChange);
        this.editor.on('focus', this.handleFocus);
        this.editor.on('blur', this.handleBlur);
    }
    
    render() {
        return (
            <div>
                <texarea ref="textZone" className={ this.props.className } />
            </div>
        );
    }
}