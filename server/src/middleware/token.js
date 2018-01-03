var jwt = require('../common/jwt');

module.exports = (app) => {
    return function *(next) {
        var url_path = this.path;

        if (url_path.indexOf('/api') > -1 &&
            url_path.indexOf('signin') === -1 &&
            url_path.indexOf('signup') === -1) {
            var jwt_token = this.header.authorization.split(' ')[1] || '';
            var loginStatus = jwt.checkToken(jwt_token);
            
            if(loginStatus.code  === 10000){
                app.context.user_id = jwt.getInfo(jwt_token).name;
                yield next;
            } else if (loginStatus.code  === 10001) {
                app.context.user_id = jwt.getInfo(loginStatus.token).name;
                this.set('Authorization', 'Bearer ' + loginStatus.token);
                this.set('user_id', app.context.user_id);
                yield next;
            }else{
                this.body = { 
                    code: 100002, 
                    msg: loginStatus.msg, 
                    data: {}
                }
                return;
            }
        }
        
        yield next;
        if (404 == this.response.status && !this.response.body) this.throw(404);
    }
}