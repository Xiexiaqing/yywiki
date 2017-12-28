/**
 * 获取浏览器基本信息 仅 weibo.com、weibo.cn 及其子域名可以调用
 * @param {Object} opts
 * @param {Function} opts.onSuccess 执行成功回调
 * @param {Function} opts.onFail 执行失败回调
 * @return {Object} 
    clientVersion: 当前客户端的版本，如 4.6.0
    browserType: 当前浏览器的类型：
        normal 普通浏览器
        topnav 顶导浏览器
        infopage 媒体正文页
    from: 客户端的 from 值
    wm: 客户端的 WM 值
    lang: 客户端的语言设置：zh_CN、zh_HK、en_US
    featureCode: 统计参数
    parentFeatureCode: 统计参数，上一级页面的 featureCode
    fid: 统计参数
    lfid: 统计参数
    uicode: 统计参数
    luicode: 统计参数
    cardid: 统计参数
    lcardid: 统计参数
 * @weibo >=4.6.0
 * @Auther MrGalaxyn
 * 错误码
    代码        Status Code           含义
    200         OK                  操作成功
    400         MISSING_PARAMS      缺少必须的参数
    403         ILLEGAL_ACCESS      非法调用
    500         INTERNAL_ERROR      客户端内部处理错误
    501         ACTION_NOT_FOUND    客户端未实现此 action
    550         NO_RESULT           客户端没有获取到结果
    550         USER_CANCELLED      用户取消了操作
    553         SERVICE_FORBIDDEN   相关服务未启用或被禁止 (如定位服务，相册权限)
 */
import addEventListener from 'dom-helpers/events/on';

export default function(opts) {
    opts = Object.assign({
        onSuccess: function() {},
        onFail: function() {}
    }, opts);

    var bridgeReady = function() {
        window.WeiboJSBridge.invoke("getBrowserInfo", null, function (params, success, code) {
            if (success) {
                opts.onSuccess(params);
            } else {
                opts.onFail(code);
            }
        });
    }

    if (!window.WeiboJSBridge) {
        opts.onFail(550);
        addEventListener(document, 'WeiboJSBridgeReady', bridgeReady);
        return;
    }

    bridgeReady();
}
