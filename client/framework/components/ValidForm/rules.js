//基础验证，非空为通过

export default {
    notEmpty: function(_val) {
        if (_val === null || _val === undefined) return true;
        return /^\s*$/g.test(_val.replace(/^\s+|\s+$/g, ''));
    },
    isDef: function(_val) {
        return _val === '';
    },
    //不区分中英文字符区别
    noDiffMax: function(_val, max) {
        if (!_val) return true;
        if (_max > 0) return _val.length > _max;
    },
    tel: function(_val) {
        if (!_val) return true;
        return !/(^1[0-9]{10}$)|(^[\d\(\)（）_-]{4,15}$)/.test(_val);
    },
    // 港澳8-11位
    phone: function(_val) {
        if (!_val) return true;
        return !/(^1[0-9]{10}$)|(^[0-9]{8}$)/.test(_val);
    },
    // 最小字符数
    min: function(_val, _min) {
        _val = '' + _val;
        if (!_val) return true;
        if (_min > 0) return _val.replace(/[^\x00-\xff]/g, "rr").length < _min;
    },
    max: function(_val, _max){
        _val = '' + _val;
        if (!_val) return true;
        if (_max > 0) return _val.replace(/[^\x00-\xff]/g, "rr").length > _max;
    },
    numeric: function(_val, _max, _min) {
        if (!_val) return true;
        if (!/^[0-9]+$/.test(_val)) return true;
        _val = parseInt(_val, 10);
        //检验是否有按字符数计算长度的验证，有就跳过验证最大最小值
        if (_max || _min) {
            if (_max && _val > parseInt(_max, 10)) return true;
            if (_min && _val < parseInt(_min, 10)) return true;
        }
        //验证正确
        return false;
    },
    moreThan: function(_val, _min){
        _val += '';
        if (!_val) return true;
        if (!/^[0-9\-\.]+$/.test(_val)) return true;
        _val = parseFloat(_val, 10);//parseInt改为parseFloat
        //检验是否有按字符数计算长度的验证，有就跳过验证最大最小值
        if (_min) {
            if (_min && _val < parseFloat(_min, 10)) return true;
        }
        //验证正确
        return false;
    },
    lessThan: function(_val, _max){
        _val += '';
        if (!_val) return true;
        if (!/^[0-9\-\.]+$/.test(_val)) return true;
        _val = parseFloat(_val, 10);
        //检验是否有按字符数计算长度的验证，有就跳过验证最大最小值
        if (_max) {
            if (_max && _val > parseFloat(_max)) return true;
        }
        //验证正确
        return false;
    },
    notAllNum: function(_val) {
        if (!_val) return true;
        return /^[0-9]*$/.test(_val);
    },
    alphaAndNumeric: function(_val) {
        if (!_val) return true;
        return !/^[a-zA-Z0-9]*$/.test(_val);
    },
    normal: function(_val) {
        if (!_val) return true;
        return !/^[a-zA-Z0-9\u4e00-\u9fa5]*$/.test(_val);
    },
    integer: function(_val) {
        _val += '';
        if(!_val) return true;
        return parseInt(_val) != _val;
    },
    positiveInterger:function(_val){//非负整数
        if(!_val) return true;
        return !/^\d+$/.test(_val);
    },
    float: function(_val) {
        if (!_val) return true;
        return !/^[0-9]*\.{0,1}[0-9]{0,2}$/.test(_val);
    },
    chinese: function(_val) {
        if (!_val) return true;
        return !/^[\u4e00-\u9fa5]*$/.test(_val);
    },
    checkurl: function(_val) {
        if (!_val) return true;
        return !/^(http:\/\/)?([A-Za-z0-9]+\.[A-Za-z0-9\/=\?%_~@&#:;\+\-]+)+$/i.test(_val);
    },
    // Email
    email: function(_val) {
        if (!_val) return true;
        return !/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i.test(_val);
    },
    url: function(_val) {
        if (!_val) return true;
        var strRegex = "^((https|http|ftp|rtsp|mms)://)" +
            "(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" + //ftp的user@  
            "(([0-9]{1,3}\.){3}[0-9]{1,3}" + // IP形式的URL- 199.194.52.184  
            "|" + // 允许IP和DOMAIN（域名） 
            "([0-9a-z_!~*'()-]+\.)*" + // 域名- www.
            "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." + // 二级域名 
            "[a-z]{2,6})" + // first level domain- .com or .museum
            "(:[0-9]{1,4})?"; // 端口- :80
        var re = new RegExp(strRegex);
        if (re.test(_val)) {
            return !/\./g.test(_val);
        }
        return true;
    },
    IDcard: function(_val) {//身份证号码
        if (!_val) return true;
        return !/^(\d{8}[01]\d[0123]\d{4})|(\d{6}(19|20)\d{2}[01]\d[0123]\d{4}[0-9Xx])$/.test(_val);
    },
    //英文 、中文、数字
    chineseAlphaNumeric: function(_val) {
        if (!_val) return true;
        return !(/^(?:#){0,1}[\d\u4e00-\u9fa5a-zA-Z_]+?(?:#){0,1}$/.test(_val));
    },
    zipcode: function(_val) {
        if (!_val) return true;
        return !/^[0-9]\d{5}$/.test(_val);
    },
    ajax: function(_val){
        var _url = _val.getAttribute('get');
        if(!_val || !_url){return;}
        var _param = $.queryToJson(_val.getAttribute('getparams')||'');
        _param[_val.name] = _val;
        $.core.io.ajax({
            'url' : _url,
            'onComplete' : function(ret){
                if(ret.code == '100000'){
                    return false;
                }else{
                    return ret.msg||true;
                }
            },
            'onFail' : function(e){
                return true;
            },
            'args' : _param,
            'method' : 'get'
        });
    }
};