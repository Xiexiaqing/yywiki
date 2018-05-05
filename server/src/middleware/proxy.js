// 判断refferer
var url = require("url");
var server_config = require('../../config/index');

module.exports = () => {
    return function *(next) {
        try {
            var referer = this.headers.referer;
            var user_agent = this.headers.ua;
            var url_path = this.path;

            console.log(user_agent);
            console.log(this.headers);

            if (url_path.indexOf('/weapp') > -1) {
                
                return;
            }
			yield next;
		} catch (err) {
            yield next;
		}
    }
};