var gm = require('gm');
var imageMagick = gm.subClass({imageMagick: true});
var fs = require('fs');
var path = require('path');

var ori_path = path.join(__dirname, '../public/images/big/');
var tar_path = path.join(__dirname, '../public/images/small/');
var target_width = 375;

fs.readdir(ori_path, function(err, files) {
    if (err) {
        console.log(err);
        return;
    }

    files.forEach(function(filename) {
        var file_path = path.join(ori_path, filename);
        fs.stat(file_path,function(err, stats){
            if (err) throw err;
            
            if(stats.isFile()){
                imageMagick(file_path)
                    .size(function(err, res) {
                        var pic_width = res.width;
                        var pic_height = res.height;

                        var temp_percent = target_width / pic_width;
                        var target_height = pic_width * temp_percent;
                        
                        imageMagick(file_path)
                            .resize(target_width, target_height)
                            .write(path.join(tar_path, filename), function(err) {
                                if (err) { console.log(err); }

                                console.log('resize 完成')
                            });
                    });
            }
        });
    });
});
