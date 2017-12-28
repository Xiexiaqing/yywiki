/* eslint-env commonjs */
import React, { Component } from 'react'
import SceneChange from 'components/SceneChange/SceneChange';
import Toast from 'components/Toast/Toast';
import setting from 'config/setting';
import { browserHistory } from 'react-router'
import PropTypes from 'prop-types';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

export default (WrappedComponent, routingState, connector) => {
    const routerContainerDisplayName = `routerComponent(${getDisplayName(WrappedComponent)})`;

    class RouterComponent extends Component {
        static displayName = routerContainerDisplayName;
        static WrappedComponent = WrappedComponent;

        static propTypes = {
            location: PropTypes.object.isRequired
        }

        static contextTypes = {
            router: PropTypes.object.isRequired
        }

        state = {
            isChanging: true,
            isFetching: true,
            msg: "",
            location: ""
        }

        static childContextTypes = {
            connector: PropTypes.object,
            createAction: PropTypes.func,
            location: PropTypes.object
        }

        getChildContext() {
            return {
                createAction: connector.createAction,
                connector, location: this.props.location
            };
        }

        trySubscribe = (stateProps) => {
            if (this.state.msg !== stateProps.msg) {
                this.setState({ msg: stateProps.msg });
            }
            this.prevlocation = stateProps.location;
        }

        handleToastHide = () => {
            connector.createAction('repoch.setMsg')
        }

        componentWillMount = () => {
            if (setting.use_default_onFail) {
                let connect = connector.connect;
                this.unsubId = connect(['repoch.msg'], this.trySubscribe);
            }
        }

        componentDidMount = () => {
            this.unObserve = routingState.observe((isChanging, isFetching) => {
                this.setState({ isChanging, isFetching });
            });
            let el = document.getElementById("default_loading");
            el && el.parentNode && el.parentNode.removeChild(el);
        }

        componentWillUnmount = () => {
            this.unObserve();
            connector.off(this.unsubId);
        }

        render() {
            let { isChanging, isFetching, msg } = this.state;

            return (
                <div>
                    {
                        (isChanging || isFetching) ? 
                            <div className="default_projectstory_loading">
                                <div style={{ height: '300px' }}>
                                     <SceneChange />
                                </div>
                            </div> :
                            <WrappedComponent { ...(this.props || {}) }/>
                    }
                    {
                        setting.use_default_onFail ? 
                            <Toast
                                content={ msg }
                                onHide={ this.handleToastHide } 
                            /> : 
                            null
                    }
                    
                </div>
            );
        }
    }

    return RouterComponent;
}
