// 判断refferer
var url = require("url");
var server_config = require('../../config/index');

module.exports = () => {
    var static_url = server_config.releae_host || '127.0.0.1:3333';

    return function *(next) {
        try {
            if (this.env === 'development') {
                return next();
            }

            var referer = this.headers.referer;
            var url_path = this.path;

            if (!referer) {
                if (url_path.indexOf('/api') > -1) {
                    this.status = 500;
                    this.type = 'application/json';

                    this.body = "error";
                    return;
                }
            } else {
                var url_obj = url.parse(referer);
                if (url_obj.host !== static_url) {
                    this.status = 500;
                    this.type = 'application/json';

                    this.body = "error";
                    return;
                }
            }
			yield next;
		} catch (err) {
            yield next;
		}
    }
};