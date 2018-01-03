var request = require("co-request");
var md5 = require("md5");
var parse = require('co-busboy');
var fs = require("fs");
var path = require("path");
var exif_image = require('exif').ExifImage;

module.exports = function(db_instance, app) {
	return function *(ctx, next) {
        if('POST' != this.method) return yield next;
        var user_id = app.context.user_id || '';
        if (user_id === '') {
            this.body = {
                code: 100005,
                msg: "数据获取错误",
                data: {}
            };

            return;
        }
        
        var feed_model = db_instance['Feed'];

        // multipart upload  
        var parts = parse(this);
        var text = '';
        var record_time = '';
        var visiable_range = '';
        var file_type = 'text';
        var directory_name = 'images';
        var part;

        var logged_files = [];
        var feed_id = md5(new Date().getTime() + '_' + user_id);
        var image_exif = '';

        while (part = yield parts) {
            if (part[0] == 'text') {
                text = part[1];
                continue;
            }

            if (part[0] == 'record_time') {
                record_time = part[1];
                continue;
            }

            if (part[0] == 'visiable_range') {
                visiable_range = part[1];
                continue;
            }

            if (part[0] == 'file_type') {
                file_type = part[1];
                continue;
            }

            if (file_type === 'video') {
                directory_name = 'videos';
            } else if (file_type === 'pic') {
                directory_name = 'images';
            }

            if (part.filename) {
                var file_name = md5(new Date().getTime() + '_' + user_id + '_' + part.filename);
                var ext = part.filename.split('.').reverse()[0];
                var stream = fs.createWriteStream(path.join(__dirname, '../../public/' + directory_name + '/' + file_name + '.' + ext));  
                part.pipe(stream);
                console.log('uploading %s -> %s', part.filename, stream.path);  
                logged_files.push(file_name + '.' + ext);
                // image_exif = yield getEXIF(path.join(__dirname, '../../public/images/' + file_name + '.' + ext));
                // console.log(image_exif);
            }
        }

        var feed_item = new feed_model();
        feed_item.feed_id = feed_id;
        feed_item.log_time = getNowDate();
        feed_item.user_id = user_id;
        feed_item.type = file_type;
        feed_item.text = text;
        feed_item.article_id = '';
        feed_item.files = logged_files;
        feed_item.date = record_time !== '' ? getNowDate(new Date(record_time)) : getNowDate();
        feed_item.visiable_range = visiable_range;
        feed_item.remark = '';

        var save_res = yield feed_item.save();

        if (save_res) {
            this.body = {
                code: 100000,
                msg: "",
                data: image_exif
            };

            return;
        }
        
        this.body = {
            code: 100005,
            msg: "保存出错",
            data: ""
        };
	}
};

// 暂时先不做获取exif信息
function *getEXIF(filePath) {
    return new Promise(resolve => {
        exif_image(filePath, (err, data) => {
            resolve(data);
        });
    });
}

function getNowDate(target_date) {
    var now_date = target_date ? target_date : new Date();

    var y = now_date.getFullYear();
    var m = formatVal(now_date.getMonth() + 1);
    var d = formatVal(now_date.getDate());

    var h = formatVal(now_date.getHours());
    var M = formatVal(now_date.getMinutes());
    var s = formatVal(now_date.getSeconds());
    
    return y + '-' + m + '-' + d + ' ' + h + ':' + M + ':' + s;
}

function formatVal(val) {
    val = val < 10 ? '0' + val : val;

    return val;
}
