import 'statics/css/antd-mobile.css';
import 'statics/css/patch.css';

import PropTypes from 'prop-types';
import React from 'react';

export default class App extends React.Component {
    constructor() {
        super();
    }
    
    static propTypes = {
        children: PropTypes.node,
        location: PropTypes.object
    }

    state = {
    }

    componentWillMount = () => {
    }

    componentWillReceiveProps = (nextProps) => {
       
    }

    render() {
        return (
            <div>
                { this.props.children }
            </div>
        );
    }
}
