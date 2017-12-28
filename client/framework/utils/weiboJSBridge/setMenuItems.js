/**
 * 设置浏览器右上角菜单内容
 * 仅 weibo.com、weibo.cn、sina.com、sina.com.cn 及其子域名可以调用
 * @param {Object} opts
 * @param {Array} opts.items - 
  {
    title：按钮的标题
    color：标题的颜色，目前只支持 red 或普通
    scheme：点击跳转的地址，可以为 http(s)、sinaweibo scheme，http链接在当前页面跳转，sinaweibo链接在新界面打开。如果为空，点击不跳转。
    code：item的标识码，可以为整数或字符串，可以和 menuItemSelected 事件配合使用
  }
 * @param {Function} opts.onSuccess 执行成功回调
 * @param {Function} opts.onFail 执行失败回调
 * @example 
        var opts = {};
        opts.items = [{
            "title": "打开发布器", "scheme": "sinaweibo://sendweibo"
        }, {
            "title": "跳转到 weibo.com", "scheme": "http://weibo.com"
        }, {
            "title": title, "color": color, "code": redButtonCode
        }, {
            "title": "恢复原始菜单", "code": revertButtonCode
        }, {
            "title": "关闭浏览器", "scheme": "sinaweibo://browser/close", "color": "red"
        }];
        STK.utils.weiboJSBridge.setMenuItems(opts);
 * @weibo >=5.1.0
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
        items:[],
        onSuccess: function() {},
        onFail: function() {}
    }, opts);

    var bridgeReady = function() {
        window.WeiboJSBridge.invoke("setMenuItems", {items: opts.items}, function(params, success, code) {
            if (success) {
                opts.onSuccess();
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
