React Image Lazy Load Component
v0.1
quanwei1
=========================

### Return
---------------
<img> JSX Element


###Props
---------------
pid:              string    --- 图片pid
imgW:             number    --- 图片的显示宽度（计算图片显示比例，非图片真实显示宽度）
imgH:             number    --- 图片的显示高度（计算图片显示比例，非图片真实显示高度）
needBlur:         bool      --- 是否需要高斯模糊效果，默认true
imgQual:          string    --- 图片质量，可用参数可参见图床文档，默认large
throttle:         number    --- 调用检查是否在视窗内函数的间隔时间，默认250ms
onContentVisible: func      --- 图片加载完毕后的回调函数

offsetTop:        number    --- 图片提前加载的阈值

###Usage
---------------
import LazyLoad from 'components/LazyLoad/LazyLoad';
<LazyLoad/>

使用时组件会生成一个img元素，该img元素的宽度跟容器宽度一致(width: 100%)，使用时宽度可通过控制外部的包裹容器的宽度来控制img元素的宽度