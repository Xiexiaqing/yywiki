var request = require("co-request");
var md5 = require("md5");
var parse = require('co-busboy');

module.exports = function(db_instance) {
	return function *(ctx, next) {
        if('POST' != this.method) return yield next;

        var user_model = db_instance['User'];
        var user_id = '';
        var password = '';
        var invite_num = '';
        var birthday = '';

        var parts = parse(this);

        while (part = yield parts) {
            if (part[0] == 'user_id') {
                user_id = part[1];
            }

            if (part[0] == 'password') {
                password = md5(part[1]);
            }

            if (part[0] == 'invite_num') {
                invite_num = part[1];
            }

            if (part[0] == 'birthday') {
                birthday = part[1].split('T')[0];
            }
        }

        if (invite_num != '20160818') {
            this.body = {
                code: 100005,
                msg: "邀请码错误",
                data: ""
            };
            return;
        }

        var exit_res = yield user_model.findOne({ user_id: user_id });

        if (exit_res) {
            this.body = {
                code: 100005,
                msg: "用户名已存在",
                data: ""
            };
            return;
        }

        var user_item = new user_model();
        user_item.user_id = user_id;
        user_item.signup_time = getNowDate();
        user_item.password = password;
        user_item.birthday = birthday;
        user_item.remark = '';

        var save_res = yield user_item.save();

        if (save_res) {
            this.body = {
                code: 100000,
                msg: "注册成功",
                data: ""
            };

            return;
        }
        
        this.body = {
            code: 100005,
            msg: "注册出错",
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
