export default function buildWeiboImageURL(id, opts) {
    var oOpts = {
        size : 'large'
    };
    oOpts = Object.assign({}, oOpts, opts);
    
    var size = oOpts.size;

    //json to img types
    var types = {
        ss: {
            middle: '&690',
            bmiddle: '&690',
            small: '&690',
            thumbnail: '&690',
            square: '&690',
            orignal: '&690'
        },
        ww: {
            middle: 'bmiddle',
            large: 'large',
            bmiddle: 'bmiddle',
            small: 'small',
            thumbnail: 'thumbnail',
            square: 'square',
            orignal: 'large'
        }
    };
    //check 'w'
    var isW = id.charAt(9) === 'w';
    var ext = id.charAt(21) === 'g' ? '.gif' : '.jpg';
    //build url
    var url = 'http://' + (isW ? 'ww' : 'ss') + '3.sinaimg.cn/' + (isW ? (types['ww'][size] || size) : size) + '/' + id + (isW ? ext : '') + (isW ? '' : types['ss'][size]);
    
    return url;
}
