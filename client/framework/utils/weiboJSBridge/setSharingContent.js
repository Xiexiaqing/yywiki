/**
 * 设置浏览器分享内容
 * 仅 weibo.com、weibo.cn、sina.com、sina.com.cn、weimai.com 及其子域名可以调用
 * external 字段如果为空，将清空所有已设置的分享内容
 * infoPage 站内分享时会使用 page_id, page_title 来分享 url
 * infoPage 站外分享时会使用 page_id 来生成最终的分享 url。如果没有 page_id，会使用当前页面 url
 * 非 infoPage 浏览器无法配置站内分享内容（page_id, page_title 无效）
 * @param {Object} opts
 * @param {Object} opts.external - 设置分享到微信、微米等外部社交平台的内容
   { 
    icon: 图片的 url
    title: 标题
    desc: 描述
   }
 * @param {String} opts.page_id 分享时使用的 page_id
 * @param {String} opts.page_title 分享时使用的 page_title 必须和 page_id 对应
 * @param {Function} opts.onSuccess 执行成功回调
 * @param {Function} opts.onFail 执行失败回调
 * @exanmple
    var opts = {
        external: {
            title: 'JSBridge分享',
            icon: 'http://tp4.sinaimg.cn/1642909335/180/22867541466/0',
            desc: '分享自 bridge Demo',
        },
        page_id: '10012046459',
        page_title: '蝙蝠侠：黑暗骑士',
    };
    STK.utils.weiboJSBridge.setSharingContent(opts);
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
        external: {},
        page_id: '',
        page_title: '',
        onSuccess: function() {},
        onFail: function() {}
    }, opts);

    var bridgeReady = function() {
        var params = {
            external: opts.external,
            page_id: opts.page_id,
            page_title: opts.page_title
        }

        window.WeiboJSBridge.invoke("setSharingContent", params, function(params, success, code) {
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
