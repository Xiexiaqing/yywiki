var jwt = require('../../common/jwt');

module.exports = function(db_instance, app) {
	return function *(ctx, next) {
        if('GET' != this.method) return yield next;
        
        var user_id = app.context.user_id || '';

        if (user_id === '') {
            this.body = {
                code: 100005,
                msg: "数据获取错误",
                data: {}
            };

            return;
        }

        var res = {};

        var user_model = db_instance['User'];
        var feed_model = db_instance['Feed'];
        var user_res = yield user_model.findOne({ user_id: user_id });
        
        res.birthday = user_res.birthday;
        res.user_id = user_id;
        res.feed_count = yield feed_model.find({ user_id: user_id }).count();
    
        this.body = {
            code: 100000,
            msg: "",
            data: res
        };
    }
};
