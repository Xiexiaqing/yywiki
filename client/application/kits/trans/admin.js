/*
 * @使用方法
 *         import test_trans from './test';
 *         test_trans.request('test', 'a=1&b=2').then(function(succ_res){}, function(err_res){});
 */
import inter from './inter';

let t = inter();

t.register("create", {url:'/api/do/create',method:'post'});
t.register("list", {url:'/api/get/feed/list',method:'get'});
t.register("signup", {url:'/api/do/signup',method:'post'});
t.register("signin", {url:'/api/do/signin',method:'post'});
t.register("check_token", {url:'/api/do/check/token',method:'get'});
t.register("get_user_info", {url:'/api/get/user/info',method:'get'});

module.exports = t;