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

                    if (conf.method.toLowerCase() === 'get') {
                        res = (await axios.get(`${conf.url}?${query}`, {
                            timeout: 10000
                        })).data;
                    } else if (conf.method.toLowerCase() === 'post') {
                        res = (await axios.post(conf.url, query, {
                            timeout: 10000
                        })).data;
                    }

                    if (res.code === 100000) {
                        resolve(res);
                    } else if (res.code === 100002) {
                        // 非登陆情况下，项目统一处理
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