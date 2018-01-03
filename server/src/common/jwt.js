var crypto = require('crypto');
var JWT_SECRET = '7634a7eefd1bf048aa006f5ee7c0962a7ac74ca42599d6e0b5f01850d12a535cd867d00ba2f0e24b2ebf769162e5091eb1bc4fe14fa4419da0aad6ad464a3f77779bed69bfcaffc0b98788a05ee0144690849a5c45f83830737b00682c2828d1e3208e66e010a2bcf98ae279c0d512117ac396e6f8303e2ffb4726b335dbabd1';

function base64Encode(jsonInfo){
    return new Buffer(JSON.stringify(jsonInfo)).toString('base64');
}

function base64Decode(base64str) {
    return new Buffer(base64str, 'base64').toString('utf8');
}

function HMACSHA256(str){
    var hmac = crypto.createHmac('sha256', JWT_SECRET);

    return crypto.createHmac('sha256', JWT_SECRET).update(str).digest().toString('base64');  
}

// create token
function createToken(u){
    var iat = Math.round(new Date().getTime()/1000);
    var header = {
      'typ': 'JWT',
      'alg': 'HS256'
    };
    var payload= {
      "name": u,
      "exp": iat + 7*24*3600, //指定token的生命周期，设为7天
      "iat": iat //token创建时间
    }
    var encodedString = base64Encode(header) + '.' + base64Encode(payload);
    var signature = HMACSHA256(encodedString);

    return encodedString + '.' + signature;
}

exports.checkToken = function(token){
    // 10000: 已登录
    // 10001: 已登录，并下发新的token

    // 10010: 无token
    // 10011: token格式错误
    // 10012: token加密后不匹配

    // 10020: token创建时间错误
    // 10021: token过期

    if(!token) return {code: 10010};
    if(!/[A-Za-z\d\+\/=].[A-Za-z\d+\/=].[A-Za-z\d+\/=]/.test(token)) return {code: 10011, msg: "token格式错误"};

    var temp = token.split(".");
    var payload = JSON.parse(base64Decode(temp[1]));
    var now = Math.round(new Date().getTime()/1000);

    if(HMACSHA256(temp[0]+ '.' + temp[1]) != temp[2]) return {code: 10012, msg: "token错误"}; 
    //创建时间错误
    if(now < payload.iat) return {code: 10020, msg: "token创建时间错误"}; 
    //过期，设置3分钟缓冲
    if(now > payload.exp + 180) return {code: 10021, msg: "token过期"}; 
    //提前10分钟
    if(now >= payload.exp - 180){
        return {
            code: 10001,
            token: createToken(payload.name), 
            msg: "update token"
        }
    }else{
        return {
            code: 10000, 
            msg: "token验证通过"
        }
    }
    
}

exports.getInfo = function(token){
    var temp = token.split(".");
    return JSON.parse(base64Decode(temp[1]));
}

exports.createToken = createToken;
