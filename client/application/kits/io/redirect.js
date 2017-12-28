import browserHistory from 'react-router/lib/browserHistory';
import isURLSameOrigin from 'utils/isURLSameOrigin';

export function doJumpPage(url, forceJumping) {
    if (forceJumping) {  //强制window.location.href跳转
        window.location.href = url;
    } else if (url[0] === '/' || isURLSameOrigin(url)){  //根据传入url自动判断
        browserHistory.push(url);
        //否则使用window.location跳链 
    } else{
        // window['__store'].dispatch(fetchNewComponent(true));
        url += url.indexOf('sinainternalbrowser') < 0 ? 
                ((url.indexOf('?') < 0 ? '?' : '&') + 'sinainternalbrowser=topnav') :
                '';

        window.location.href = url;
    }
}