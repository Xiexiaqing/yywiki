/* eslint-env commonjs */
import { Component, createElement } from 'react';
import shallowEqual from '../utils/shallowEqual';
import isPlainObject from 'lodash/isPlainObject';
import PropTypes from 'prop-types';

const defaultMergeProps = (stateProps, parentProps) => ({
  ...parentProps,
  ...stateProps
});

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

function checkContainerArgument (mapStateToProps, mergeProps) {
    if (process.env.NODE_ENV !== 'production') {
        let isAllArray = mapStateToProps.every(function(mapState) {
            return Array.isArray(mapState);
        });
        if (!isAllArray) {
            console.error('createContainer mapStateToProps has noArray value, may be forget a ","', mapStateToProps)
        }
    }
}

function getDefaultProps(type) {
    switch(type) {
        case 'object':
            return {};

        case 'array':
            return [];

        case 'number':
            return 0;

        case 'string':
            return '';

        case 'bool':
            return false;

        default:
            return '';
    }
}

export default function createContainer(mapStateToProps, mergeProps) {
    checkContainerArgument(mapStateToProps, mergeProps);

    return function wrapWithConnect(WrappedComponent) {
        const shouldSubscribe = 
                Boolean(mapStateToProps) || mapStateToProps.length > 0;

        const createContainerDisplayName = 
                `createContainer(${getDisplayName(WrappedComponent)})`;

        const finalMergeProps = mergeProps || defaultMergeProps;

        WrappedComponent.propTypes = WrappedComponent.propTypes || {};
        WrappedComponent.defaultProps = WrappedComponent.defaultProps || {};
        WrappedComponent.contextTypes = {
            createAction: PropTypes.func.isRequired,
            router: PropTypes.object.isRequired
        }

        function checkStateShape(props, methodName) {
            if (!isPlainObject(props)) {
                console.warn(
                    `${methodName}() in ${createContainerDisplayName} must` +
                    ` return a plain object. Instead received ${props}.`
                );
            }
        }

        function computeMergedProps(stateProps, parentProps) {
            const mergedProps = finalMergeProps(stateProps, parentProps);
            if (process.env.NODE_ENV !== 'production') {
                checkStateShape(mergedProps, 'mergeProps');
            }
            return mergedProps;
        }

        class Connect extends Component {
            constructor(props, context) {
                super(props, context);
                this.clearCache();
            }

            state = {
                stateProps: {}
            }

            shouldComponentUpdate() {
                return this.haveOwnPropsChanged || this.haveStoreStateChanged;
            }

            componentWillMount = () => {
                if (!shouldSubscribe) {
                    return;
                }
                    
                let stateToPropsMap = mapStateToProps.map(mapInfo => {
                    if (mapInfo.length > 1) {
                        if (mapInfo[1] === 'func') {
                            if (process.env.NODE_ENV !== 'production') {
                                console.warn("can not map 'func' now, state props should be plain object, " +
                                    "if you want to create action use context.createAction instead.");
                            }
                        }

                        let requireTypes = mapInfo[1].split('|');
                        let key = mapInfo[0].split('.').pop();
                        if (requireTypes.length > 1) {
                            let compPropsTypes = requireTypes.map(prop => PropTypes[prop]);
                            WrappedComponent.propTypes[key] = PropTypes.oneOfType(compPropsTypes);
                        } else {
                            WrappedComponent.propTypes[key] = PropTypes[mapInfo[1]];
                        }

                        if (mapInfo.length === 3) {
                            WrappedComponent.defaultProps[key] = mapInfo[2];
                        } else {
                            if (process.env.NODE_ENV !== 'production') {
                                console.info("props key: " + key + ", use default props: " + 
                                    JSON.stringify(getDefaultProps(requireTypes[0])));
                            }
                            WrappedComponent.defaultProps[key] = getDefaultProps(requireTypes[0]);
                        }
                    }                    

                    return mapInfo[0];
                });

                let connect = this.context.connector.connect;
                this.unsubId = connect(stateToPropsMap, this.trySubscribe);
            }

            componentWillReceiveProps = (nextProps) => {
                if (!shallowEqual(nextProps, this.props)) {
                    this.haveOwnPropsChanged = true
                }
            }

            componentWillUnmount() {
                this.tryUnsubscribe()
                this.clearCache()
            }

            trySubscribe = (stateProps) => {
                this.haveStoreStateChanged = true;
                this.setState({ stateProps });
            }

            tryUnsubscribe() {
                this.context.connector.off(this.unsubId);
            }

            updateMergedPropsIfNeeded() {
                const nextMergedProps = computeMergedProps(
                    this.state.stateProps, this.props
                );

                if (nextMergedProps && this.mergedProps) {
                    nextMergedProps._mergedTime = this.mergedProps._mergedTime;
                }

                if (this.mergedProps && 
                        shallowEqual(nextMergedProps, this.mergedProps, true)
                ) {
                    return false
                }

                this.mergedProps = nextMergedProps;
                this.mergedProps['_mergedTime'] = Date.now();

                return true
            }

            clearCache() {
                this.mergedProps = null;
                this.haveOwnPropsChanged = true;
                this.haveStoreStateChanged = true;
                this.renderedElement = null;
            }

            render() {
                const {
                    haveOwnPropsChanged,
                    haveStoreStateChanged,
                    renderedElement
                } = this;

                this.haveOwnPropsChanged = false;
                this.haveStoreStateChanged = false;

                let haveMergedPropsChanged = true;
                if (haveStoreStateChanged || haveOwnPropsChanged) {
                    haveMergedPropsChanged = this.updateMergedPropsIfNeeded();
                } else {
                    haveMergedPropsChanged = false;
                }

                if (!haveMergedPropsChanged && renderedElement) {
                    return renderedElement;
                }

                this.renderedElement = createElement(
                    WrappedComponent,
                    this.mergedProps
                );

                return this.renderedElement;
            }
        }

        Connect.displayName = createContainerDisplayName;
        Connect.WrappedComponent = WrappedComponent;
        Connect.contextTypes = { connector: PropTypes.object.isRequired };

        return Connect;
    };
}
