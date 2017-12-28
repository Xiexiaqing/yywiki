import axios from 'utils/axios';

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

export function doJumpPage(url, history, forceLocation){
    if(forceLocation){  //强制window.location.href跳转
        window.location.href = url;
    }else{  //根据传入url自动判断
        let hostname = window.location.hostname;//当前域名
        let aimDomain = url.replace(/^(https:\/\/|http:\/\/)?/i, '').match(/.*(.cn|.com|.net)/i) || (/sinaweibo:\/\//gi).test(url);

        //如果url中的域名和当前域名相同或url中没有域名则使用pushState跳链
        //否则使用window.location跳链
        if(!aimDomain || aimDomain === hostname){
            // console.log('sameDomain')
            history.pushState(null, url);
        }else{
            // console.log('notSameDomain')
            window.location.href = url;
        }
    }
}