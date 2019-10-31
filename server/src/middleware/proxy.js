// 判断refferer
var url = require("url");
var server_config = require('../../config/index');

module.exports = () => {
    return function *(next) {
        try {
            var referer = this.headers.referer;
            var url_path = this.path;

            // 微信登陆需要的头
            var x_wx_code = this.headers['x-wx-code'];
            var x_wx_iv = this.headers['x-wx-iv'];
            var x_wx_encrypted_data = this.headers['x-wx-encrypted-data'];
            var user_agent = this.headers['user-agent'];

            if (url_path.indexOf('/weapp') > -1) {
                
                return;
            }
			yield next;
		} catch (err) {
            yield next;
		}
    }
};