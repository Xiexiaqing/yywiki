import React from 'react';
import ReactDOM from 'react-dom';
import createContainer from 'lib/createContainer';
import { Toast, NoticeBar, Tabs, TextareaItem, ImagePicker, List, NavBar, DatePicker, Picker } from 'antd-mobile';
import Separator from 'comps/common/Separator/Separator';
import axios from 'utils/axios';

const Item = List.Item;

const RANGE_MAPPER = [
    { label: '所有人', value: 'all' },
    { label: '仅自己', value: 'self'}
];
const TABS_MAPPER = [
    { title: "图片", val: "pic" },
    { title: "视频", val: "video" }
];

class Create extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            text: "",
            img_files: [],
            video_file: null,
            video_file_url: "",
            file_type: "pic",
            record_time: "",
            visiable_range: "all"
        };
    }

    handleBack = () => {
        this.context.router.goBack();
    }

    handleImageChange = (files, type, index) => {
        this.setState({
            img_files: files
        })
    }

    handleVideoUpload = (e) => {
        if (this.refs.video_input.files.length === 0) { return; }

        let file = this.refs.video_input.files[0];
        let that = this;
        let reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = function(e) {
            that.setState({
                video_file: file,
                video_file_url: e.target.result
            });
            that = null;
        };
    }

    buildVideos = () => {
        if (!this.state.video_file_url) {
            return null;
        }

        return (
            <div className="custom-flexbox-item">
                <video style={{ width: "150px", maxHeight: "150px", position: "absolute" }} src={this.state.video_file_url} />
            </div>
        );
    }

    handleInputChange = (val) => {
        this.setState({
            text: val
        });
    }

    handleSave = () => {
        if (this.state.text === '' &&
            this.state.img_files.length === 0 &&
            !this.state.video_file) {
            Toast.fail("不要提交空数据", 3);
            return;
        }

        let that = this;
        let post_file = this.state.file_type === 'pic' ? this.state.img_files[0] : this.state.video_file;

        var formData = new FormData();
        formData.append('text', this.state.text);
        formData.append('record_time', this.state.record_time);
        formData.append('visiable_range', this.state.visiable_range);

        if (this.state.img_files.length === 0 && !this.state.video_file) {
            formData.append('file_type', "text");
        } else {
            formData.append('file_type', this.state.file_type);
        }
        
        if (this.state.file_type === 'pic' && this.state.img_files.length > 0) {
            this.state.img_files.map((file_item, index) => {
                formData.append('pic_file' + index, file_item.file)
            });
        } else if (this.state.file_type === 'video' && this.state.video_file) {
            formData.append('video_file', this.state.video_file);
        }

        Toast.loading('Loading...', 0);
        
        let token = window.localStorage.getItem('jwt_token') || '';
        axios.defaults.headers.common['Authorization'] = 'JWT ' + token;

        // 因为formData传递不过去，所以暂时这样处理
        axios.post('/api/do/create', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(function (response) {
            Toast.hide();
            that.handleBack();
        })
        .catch(function (error) {
            Toast.hide();
            Toast.fail(error, 3);
        });
    }

    render() {
        const { img_files } = this.state;

        return (
            <div>
                <NavBar
                    mode="light"
                    icon={ <span>取消</span> }
                    onLeftClick={ this.handleBack }
                    rightContent={[
                        <span key="bar_0" onClick={ this.handleSave }>保存</span>
                    ]}
                >
                    新内容
                </NavBar>
                <Separator height={ 0.5 } />
                <TextareaItem onChange={ this.handleInputChange } rows={ 7 } />
                <Separator />
                <List>
                    <DatePicker
                        mode="date"
                        title="Select Date"
                        extra="当前日期"
                        value={ this.state.record_time }
                        onChange={date => this.setState({ record_time: date })}
                    >
                        <Item arrow="horizontal">记录时间</Item>
                    </DatePicker>
                    <Picker
                        data={ RANGE_MAPPER }
                        cols={ 1 }
                        title="选择可见范围"
                        extra="所有人"
                        value={ this.state.visiable_range }
                        onChange={v => this.setState({ visiable_range: v })}
                        onOk={v => this.setState({ visiable_range: v })}
                    >
                        <Item arrow="horizontal">可见范围</Item>
                    </Picker>
                </List>
                <Separator />
                <div style={{ backgroundColor: "#fff", padding: "5px" }}>
                     <Tabs
                        tabs={ TABS_MAPPER }
                        onChange={(tab, index) => { this.setState({ file_type: tab.val }) }}
                    >
                        <div style={{ alignItems: 'center', justifyContent: 'center', height: 'auto', backgroundColor: '#fff' }}>
                            <NoticeBar>一次最多上传9张图片</NoticeBar>
                            <ImagePicker
                                files={ img_files }
                                onChange={ this.handleImageChange }
                                onImageClick={ (index, fs) => console.log(index, fs) }
                                selectable={ img_files.length < 9 }
                                multiple={ true }
                            />
                        </div>
                        <div>
                            <NoticeBar>一次只能上传一个视频</NoticeBar>
                            <div className="custom-image-picker-list">
                                <div className="custom-flexbox custom-flexbox-align-center">
                                    { this.buildVideos() }
                                    <div className="custom-flexbox-item">
                                        <div className="custom-image-picker-item custom-image-picker-upload-btn">
                                            <input ref="video_input" type="file" accept="video/*" onChange={ this.handleVideoUpload }/>
                                        </div>
                                    </div>
                                    <div className="custom-flexbox-item"></div>
                                    <div className="custom-flexbox-item"></div>
                                    <div className="custom-flexbox-item"></div>
                                </div>
                            </div>
                        </div>
                    </Tabs>
                </div>
            </div>
        );
    }
}

export default createContainer([
    ['create.index.msg', 'string', ""],
])(Create);