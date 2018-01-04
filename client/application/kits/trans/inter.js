import axios from 'utils/axios';

module.exports = function() {
    var offer = {},
        argsList = [];

    offer.register = function (name, args) {
        if(argsList[name] !== undefined){
            throw name + ' interface has been registered';
        }
        
        argsList[name] = args;
    };

    offer.request = function (name, query) {
        let conf = Object.assign({}, argsList[name]);

        let promise = new Promise(function(resolve, reject){
            let realDo = async () => {
                try {
                    let res = null;
                    let res_all = null;

                    let token = window.localStorage.getItem('jwt_token') || '';
                    axios.defaults.headers.common['Authorization'] = 'JWT ' + token;

                    if (conf.method.toLowerCase() === 'get') {
                        res_all = (await axios.get(`${conf.url}?${query}`, {
                            timeout: 10000
                        }));
                    } else if (conf.method.toLowerCase() === 'post') {
                        res_all = (await axios.post(conf.url, query, {
                            timeout: 10000
                        }));
                    }

                    // 从返回头部获取token
                    let headers_authorization = res_all.headers.authorization || null;
                    let headers_user_id = res_all.headers.user_id || null;
                    if (headers_authorization) {
                        let jwt_token = headers_authorization.split(' ')[1];
                        jwt_token && window.localStorage.setItem('jwt_token', jwt_token);
                        headers_user_id && window.localStorage.setItem('user_id', headers_user_id);

                        let user_list = window.localStorage.getItem('user_list');
                        let user_obj = {};

                        if (user_list) {
                            user_obj = JSON.parse(user_list);
                        }

                        if (!user_obj[headers_user_id]) {
                            user_obj[headers_user_id] = jwt_token;
                        } else {
                            user_obj[headers_user_id] = jwt_token;
                        }

                        window.localStorage.setItem('user_list', JSON.stringify(user_obj));
                    }

                    res = res_all && res_all.data || {};
                    
                    if (res.code === 100000) {
                        resolve(res);
                    } else if (res.code === 100002) {
                        window.localStorage.removeItem('jwt_token');
                        window.localStorage.removeItem('user_id');
                        window.location.replace('/signin');
                        reject(res);
                    } else {
                        reject(res);
                    }
                } catch (error) {
                    let res = {
                        code: 900000,
                        msg: error.data,
                        data: null
                    };

                    reject(res);
                }
            };

            realDo();
        });

        return promise;
    };

    return offer;
};