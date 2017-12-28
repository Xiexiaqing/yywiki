# 富文本编辑器说明

## 目录
framework/components/RichEditor/

## 使用方法

#### 同步调用
```
import RichEditor from 'framework/components/RichEditor/RichEditor';
```
直接在render内部使用

```
<RichEditor />
```

问题：依赖文件较大，打包到一个文件中，js请求速度慢。推荐使用下面这种方法。

#### 异步加载

```
import getEditor from 'framework/components/RichEditor/getEditor';
```
在组件初始化时异步请求依赖的富文本js

```
state = {
	editor: null,
	content: ''
}

componentWillMount = () => {
	let that = this;
	getEditor().then(function(RichEditor){
		this.setState({
			editor: <RichEditor
						uploadUrl="/aj/asdkjhkj1/"
						handleChange={ that.handleChange }/>
		});
	}, function() {});
}

handleChange = (content) => {
	this.setState({
		content: content
	});
}

render() {
	return (
		<div>
			<div style={{ width: "600px", float: "left" }}>
          	{ this.state.editor }
          </div>
          <div style={{ width: "300px", float: "left" }}>
          	{ this.state.content }
          </div>
		</div>
	);
}
```

## 参数说明

- `content`: 字符串，富文本初始化内容
- `className`: 字符串，容器的样式类
- `toolbar`: 数组，富文本编辑器工具集，包含`['title','bold','italic','underline','strikethrough','fontScale','color','ol','ul','blockquote','code','table','link','image','hr','indent','outdent','alignment']`
- `handleChange`: 方法，富文本编辑器内容改变时触发
- `handleFocus`: 方法，富文本编辑器聚焦时触发
- `handleBlur`: 方法，富文本编辑器失焦时触发