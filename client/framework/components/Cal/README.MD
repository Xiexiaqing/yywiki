# 新版日历组件说明

## 目录
framework/components/Cal/Cal

## 使用方法

```
import React from 'react';
import Cal from 'components/Cal/Cal';

export default class Test extends React.Component {
    state = {
        showCal: false
    }

    handleShowCal = () => {
        !this.state.showCal && this.setState({
            showCal: true
        });
    }

    handleHideCal = () => {
        this.setState({
            showCal: false
        });
    }

    handleChoose = (val) => {
    	console.log(val);
    }

    render() {
        return (
            <div>
                <input
                    type="text"
                    ref="test"
                    placeholder="choose date"
                    style={{ height: '24px', width: '150px' }}
                    onClick={ this.handleShowCal }/>
                    {
                        this.state.showCal && (
                            <Cal
                                targetNode= { this.refs.test }
                                show={ true }
                                onHide={ this.handleHideCal }
                                onChoose={ this.handleChoose }
                                time={ true }
                                range={ false }
                                longs={ -365 } />
                        )
                    }
            </div>
        );
    }
}
```

## 参数说明

- `targetNode`: 必传，日历展示节点，且可访问其value属性
- `onShow`: 可选，组件渲染时回调
- `onHide`: 可选，组件关闭时回调
- `onChoose`: 可选，组件选择后回调
- `hideWhenMaskClick`: 可选，默认true，点击其他区域是否关闭组件
- `show`: 可选，默认false，是否展示组件
- `range`: 可选，默认false，是否是区域选择
- `time`: 可选，默认false，是否可编辑时分秒
- `sdate`: 可选，默认空，日期选择范围起始时间
- `edate`: 可选，默认空，日期选择范围结束时间
- `longs`: 可选，默认空，根据当前时间日期可选择的天数，可为负数

## 常见问题

- `time`和`range`不能同时为true，若出现会将time强制转为false
- `sdate`、`edate`和`longs`若同时为空，则可以选择1900-01-01至2100-12-31之间时间
- 建议使用上面例子中的加载`Cal`组件的方法，这样能保证每次Cal显示都是重新build，不会有偶发问题~~