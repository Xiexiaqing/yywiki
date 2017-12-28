/**
 * 打开内置浏览器菜单
 * @param {Object} opts
 * @param {Function} opts.onSuccess 执行成功回调
 * @param {Function} opts.onFail 执行失败回调
 * @return {Object}
    {
        selected_code: 用户选择的按钮所对应的编码
        selected_title: 用户选择的按钮标题
    }
 * 按钮码
    标题          编码
    微博          1001
    好友圈        1002
    私信          1003
    微信好友      1004
    朋友圈        1005
    微米好友      1006
    微米圈        1007
    来往好友      1008
    来往动态      1009
    QQ            1010
    Qzone         1011
    短信          1101
    邮件          1102
    系统浏览器    2001
    复制链接      2002
    字号设置      2003
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
 * @weibo >=5.0.0
 * @Auther MrGalaxyn
 */
import addEventListener from 'dom-helpers/events/on';

export default function(opts) {
    opts = Object.assign({
        onSuccess: function() {},
        onFail: function() {}
    }, opts);

    var bridgeReady = function() {
        window.WeiboJSBridge.invoke("openMenu", null, function(params, success, code) {
            if (success)
                opts.onSuccess(params);
            else
                opts.onFail(code);
        });
    }

    if (!window.WeiboJSBridge) {
        opts.onFail(550);
        addEventListener(document, 'WeiboJSBridgeReady', bridgeReady);
        return;
    }

    bridgeReady();
}
