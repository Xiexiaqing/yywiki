var jwt = require('../../common/jwt');

module.exports = function(db_instance, app) {
	return function *(ctx, next) {
        if('GET' != this.method) return yield next;
        var token = this.query.t;
        var loginStatus = jwt.checkToken(token);

        console.log(loginStatus);
            
        if(loginStatus.code  === 10000){
            this.set('Authorization', 'Bearer ' + token);
            this.set('user_id', jwt.getInfo(token).name);

            this.body = { 
                code: 100000, 
                msg: loginStatus.msg, 
                data: {}
            };
            return;
        } else if (loginStatus.code  === 10001) {
            this.set('Authorization', 'Bearer ' + loginStatus.token);
            this.set('user_id', jwt.getInfo(loginStatus.token).name);

            this.body = { 
                code: 100000, 
                msg: loginStatus.msg, 
                data: {}
            };
            return;
        }else{
            this.body = { 
                code: 100005, 
                msg: loginStatus.msg, 
                data: {}
            }
            return;
        }
	}
};
