webpackJsonp([13,9],{"../application/kits/io/redirect.js":function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e,t){t?window.location.href=e:"/"===e[0]||(0,s["default"])(e)?a["default"].push(e):(e+=e.indexOf("sinainternalbrowser")<0?(e.indexOf("?")<0?"?":"&")+"sinainternalbrowser=topnav":"",window.location.href=e)}Object.defineProperty(t,"__esModule",{value:!0}),t.doJumpPage=o;var i=n("./node_modules/react-router/lib/browserHistory.js"),a=r(i),u=n("./utils/isURLSameOrigin.js"),s=r(u)},"../application/kits/jsonToQuery.js":function(e,t){"use strict";var n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},r=function(e){switch("undefined"==typeof e?"undefined":n(e)){case"string":return e;case"boolean":return e?"true":"false";case"number":return isFinite(e)?e:"";default:return""}};e.exports=function(e,t,o,i){return t=t||"&",o=o||"=",null===e&&(e=void 0),"object"===("undefined"==typeof e?"undefined":n(e))?Object.keys(e).map(function(n){var i=encodeURIComponent(r(n))+o;return Array.isArray(e[n])?e[n].map(function(e){return i+encodeURIComponent(r(e))}).join(t):i+encodeURIComponent(r(e[n]))}).join(t):i?encodeURIComponent(r(i))+o+encodeURIComponent(r(e)):""}},"../application/kits/setMsgToast.js":function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t["default"]=function(e){return function(t,n){t({type:"REPOCH_MSG",msg:e})}},e.exports=t["default"]},"../application/kits/trans/admin.js":function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}var o=n("../application/kits/trans/inter.js"),i=r(o),a=(0,i["default"])();a.register("create",{url:"/api/do/create",method:"post"}),a.register("list",{url:"/api/get/feed/list",method:"get"}),a.register("signup",{url:"/api/do/signup",method:"post"}),a.register("signin",{url:"/api/do/signin",method:"post"}),a.register("check_token",{url:"/api/do/check/token",method:"get"}),a.register("get_user_info",{url:"/api/get/user/info",method:"get"}),e.exports=a},"../application/kits/trans/inter.js":function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e){return function(){var t=e.apply(this,arguments);return new Promise(function(e,n){function r(o,i){try{var a=t[o](i),u=a.value}catch(s){return void n(s)}return a.done?void e(u):Promise.resolve(u).then(function(e){r("next",e)},function(e){r("throw",e)})}return r("next")})}}var i=n("./utils/axios/index.js"),a=r(i);e.exports=function(){var e={},t=[];return e.register=function(e,n){if(void 0!==t[e])throw e+" interface has been registered";t[e]=n},e.request=function(e,n){var r=Object.assign({},t[e]),i=new Promise(function(e,t){var i=this,u=function(){var u=o(regeneratorRuntime.mark(function s(){var o,u,c,l,f,d,p,m,g;return regeneratorRuntime.wrap(function(i){for(;;)switch(i.prev=i.next){case 0:if(i.prev=0,o=null,u=null,c=window.localStorage.getItem("jwt_token")||"",a["default"].defaults.headers.common.Authorization="JWT "+c,"get"!==r.method.toLowerCase()){i.next=11;break}return i.next=8,a["default"].get(r.url+"?"+n,{timeout:1e4});case 8:u=i.sent,i.next=15;break;case 11:if("post"!==r.method.toLowerCase()){i.next=15;break}return i.next=14,a["default"].post(r.url,n,{timeout:1e4});case 14:u=i.sent;case 15:l=u.headers.authorization||null,f=u.headers.user_id||null,l&&(d=l.split(" ")[1],d&&window.localStorage.setItem("jwt_token",d),f&&window.localStorage.setItem("user_id",f),p=window.localStorage.getItem("user_list"),m={},p&&(m=JSON.parse(p)),m[f]?m[f]=d:m[f]=d,window.localStorage.setItem("user_list",JSON.stringify(m))),o=u&&u.data||{},1e5===o.code?e(o):100002===o.code?(window.localStorage.removeItem("jwt_token"),window.localStorage.removeItem("user_id"),window.location.replace("/signin"),t(o)):t(o),i.next=26;break;case 22:i.prev=22,i.t0=i["catch"](0),g={code:9e5,msg:i.t0.data,data:null},t(g);case 26:case"end":return i.stop()}},s,i,[[0,22]])}));return function(){return u.apply(this,arguments)}}();u()});return i},e}},"../application/states/signup/index.js":function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e){return function(){var t=e.apply(this,arguments);return new Promise(function(e,n){function r(o,i){try{var a=t[o](i),u=a.value}catch(s){return void n(s)}return a.done?void e(u):Promise.resolve(u).then(function(e){r("next",e)},function(e){r("throw",e)})}return r("next")})}}function i(){var e=this;return function(){var t=o(regeneratorRuntime.mark(function n(t,r){return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:try{}catch(n){t((0,p["default"])(n.message))}case 1:case"end":return e.stop()}},n,e)}));return function(e,n){return t.apply(this,arguments)}}()}function a(e){var t=this;return function(){var n=o(regeneratorRuntime.mark(function r(n,o){return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:try{f["default"].request("signup",(0,g["default"])(e)).then(function(e){(0,v.doJumpPage)("/signin")},function(e){n({type:"SIGN_UP_MSG",msg:e.msg||"网络错误，请稍后再试"})})}catch(r){n((0,p["default"])(r.message))}case 1:case"end":return t.stop()}},r,t)}));return function(e,t){return n.apply(this,arguments)}}()}function u(e){return{type:"SIGN_UP_MSG",msg:e}}function s(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:h,t=arguments[1];switch(t.type){case"SIGN_UP_MSG":return c({},e,{msg:t.msg});default:return e}}Object.defineProperty(t,"__esModule",{value:!0}),t.initialState=void 0;var c=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e};t.initPage=i,t.doSignup=a,t.setMsg=u,t.reducer=s;var l=n("../application/kits/trans/admin.js"),f=r(l),d=n("../application/kits/setMsgToast.js"),p=r(d),m=n("../application/kits/jsonToQuery.js"),g=r(m),v=n("../application/kits/io/redirect.js"),h=t.initialState={msg:""}}});