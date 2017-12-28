import axios from './axios';

export function doGetRequest(url, query) {
    let promise = new Promise(function(resolve, reject){
        let realDo = async () => {
            try {
                const res = (await axios.get(`${url}?${query}`)).data;
                resolve(res);
            } catch (error) {
                reject(error.message);
            }
        };

        realDo();
    });

    return promise;
}

export function doPostRequest(url, query) {
    let promise = new Promise(function(resolve, reject){
        let realDo = async () => {
            try {
                const res = (await axios.post(url, query)).data;
                resolve(res);
            } catch (error) {
                reject(error.message);
            }
        };

        realDo();
    });

    return promise;
}