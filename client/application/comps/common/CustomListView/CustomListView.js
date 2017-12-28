import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { ListView } from 'antd-mobile';

export default class CustomListView extends React.Component {
    constructor(props) {
        super(props);

        const dataSource = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
            sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
        });

        this.state = {
            isLoading: false,
            dataSource,
            height: document.documentElement.clientHeight * 3 / 4,
        }
    }

    static propTypes = {
        list_data: PropTypes.object,
        page_size: PropTypes.number,
        has_more: PropTypes.bool,
        onLoad: PropTypes.func,
        onRenderRow: PropTypes.func,
        onRenderSectionTitle: PropTypes.func,
        onRenderSectionWapper: PropTypes.func
    }

    static defaultProps = {
        list_data: {},
        page_size: 7,
        has_more: false,
        onLoad: () => null,
        onRenderRow: () => null,
        onRenderSectionTitle: () => null,
        onRenderSectionWapper: () => null
    }

    componentDidMount() {
        const hei = document.documentElement.clientHeight - ReactDOM.findDOMNode(this.lv).parentNode.offsetTop - 45;
        setTimeout(() => {
            this.setState({
                dataSource: this.state.dataSource.cloneWithRowsAndSections(this.props.list_data),
                height: hei
            });
        }, 200);
    }

    componentWillReceiveProps(next_props, props) {
        this.setState({
            dataSource: this.state.dataSource.cloneWithRowsAndSections(next_props.list_data),
            isLoading: false
        });
    }

    onEndReached = (event) => {
        if (this.state.isLoading || !this.props.has_more) {
            return;
        }

        this.setState({ isLoading: true });
        this.props.onLoad(this.reset);
    }

    reset = () => {
        this.setState({
            dataSource: this.state.dataSource.cloneWithRowsAndSections(this.props.list_data),
            isLoading: false
        });
    }

    render() {
        const separator = (sectionID, rowID) => {
            // 如果是最后一个就不加分隔符
            if (this.props.list_data[sectionID] &&
                this.props.list_data[sectionID][rowID] &&
                this.props.list_data[sectionID][rowID].is_last) {
                return null;
            }

            return (
                <div
                    key={`${sectionID}-${rowID}`}
                    style={{
                        backgroundColor: '#F5F5F9',
                        height: 8,
                        borderTop: '1px solid #ECECED',
                        borderBottom: '1px solid #ECECED',
                    }}
                />
            );
        };

        return (
            <ListView
                className="am-list sticky-list"
                ref={el => this.lv = el }
                dataSource={ this.state.dataSource }
                renderHeader={ null }
                renderFooter={() => (
                    <div style={{ padding: 10, textAlign: 'center' }}>
                        { this.state.isLoading ? 'Loading...' : this.props.has_more ? 'Loaded' : '--- End ---' }
                    </div>
                )}
                renderSectionHeader={ this.props.onRenderSectionTitle }
                renderSectionWrapper={ null }
                renderBodyComponent={ null }
                renderRow={ this.props.onRenderRow }
                renderSeparator={ separator }
                style={{
                    height: this.state.height,
                    overflow: 'auto',
                    zIndex: 0
                }}
                pageSize={ 4 }
                onScroll={ () => null }
                scrollRenderAheadDistance={ 500 }
                onEndReached={ this.onEndReached} 
                onEndReachedThreshold={ 10 }
            />
        );
    }
}