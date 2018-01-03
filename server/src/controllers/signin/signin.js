var request = require("co-request");
var md5 = require("md5");
var parse = require('co-busboy');
var jwt = require('../../common/jwt');

module.exports = function(db_instance) {
	return function *(ctx, next) {
        if('POST' != this.method) return yield next;

        var user_model = db_instance['User'];
        var user_id = '';
        var password = '';

        var parts = parse(this);

        while (part = yield parts) {
            if (part[0] == 'user_id') {
                user_id = part[1];
            }

            if (part[0] == 'password') {
                password = md5(part[1]);
            }
        }

        var exit_res = yield user_model.findOne({ user_id: user_id, password: password });

        if (exit_res) {
            var token = jwt.createToken(user_id);
            this.set('Authorization', 'Bearer ' + token);
            this.set('user_id', user_id);

            this.body = {
                code: 100000,
                msg: "",
                data: {}
            };
            return;
        }

        this.body = {
            code: 100005,
            msg: "账号或密码错误",
            data: ""
        };
	}
};

function getNowDate(target_date) {
    var now_date = target_date ? target_date : new Date();

    var y = now_date.getFullYear();
    var m = formatVal(now_date.getMonth() + 1);
    var d = formatVal(now_date.getDate());

    var h = formatVal(now_date.getHours());
    var M = formatVal(now_date.getMinutes());
    var s = formatVal(now_date.getSeconds());
    
    return y + '-' + m + '-' + d + ' ' + h + ':' + M + ':' + s;
}

function formatVal(val) {
    val = val < 10 ? '0' + val : val;

    return val;
}
