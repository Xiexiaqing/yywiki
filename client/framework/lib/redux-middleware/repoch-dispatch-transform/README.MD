# Ajax请求中间件
Redux-Axios-Middleware

## 意义
无需显示的调用Ajax请求，只需要dispatch一个Action即可。所有情况的回调均通过指定reducer的type处理。

## 使用方法
```
// 引用请求唯一指定标识
import { AJAX_CALL } from 'utils/ajaxMiddleware';

……

dispatch({
    [AJAX_CALL]: {
        types: ['BEFORE_REQUEST', 'SUCCESS_REQUEST', 'ERROR_REQUEST', 'FAIL_REQUEST'],
        request: {
            url: '/aj/test',
            data: {
                key: value
            },
            method: 'get'
        },
        extraData: {
            key: value
        }
    }
});

```

## 参数含义
- `AJAX_CALL`: 中间件根据这个变量匹配是否是Ajax请求
- `types`: Array，按顺序传入4个状态处理标识, 依次为'请求发出前触发', '请求成功后触发', '请求成功接口非100002触发', '请求失败后触发'
- `request.url`: String，接口地址
- `request.data`: Object, 接口调用传递的参数
- `request.method`: string，接口调用方式，只能为get，post，head，put，delete，patch，options中的一个
- `extraData`: Object，除请求返回的数据外额外需要携带的数据

## 各状态返回Action格式
####请求发出前
```
{
    type: 'REQUEST_BEFORE(自定义)',
    AJAX_CALL: {
        ……
    }
}
```

####请求成功
```
{
    type: 'SUCCESS_REQUEST(自定义)',
    resData: {
        code: 100000,
        msg: '',
        data: {}
    },
    requestOpts: {}, // 发送请求时携带的参数
    extraData: {} // 发送请求额外携带的为了reducer处理的变量
}
```

#### 请求失败
```
{
    type: 'ERROR_REQUEST/FAIL_REQUEST',
    resData: {
        code: 非100000,
        msg: '',
        data: {}
    },
    requestOpts: {}, // 发送请求时携带的参数
    extraData: {} // 发送请求额外携带的为了reducer处理的变量
}
```