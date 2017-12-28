/*
    retinize
    Automate down-scaling images from 4x or 2x to 2x and 1x.
    @Author: lihan2
    @Github: https://github.com/annalihan/retinize
*/

'use strict';

var fs = require('fs');
var path = require('path');
var gm = require('gm');
var sizeOf = require('image-size');
var rd = require('rd');
var colors = require('colors');

var root = process.argv.pop();
var config = require(path.join(root, 'config/project'));

// Define defaults
var options = {
    flags: { 1: '', 2: '@2x', 4: '@4x' },
    flagsOut: { 1: '', 2: '@2x', 4: '@4x' },
    extensions: ['jpg', 'jpeg', 'png'],
    roundUp: true,
    basePath: '/statics/images'
};


function run() {

    if (!config.retinize) {
        return;
    }

    console.log("start retinize images>>>>>>");

    rd.each(path.join(root, options.basePath), function(f,s,next){
        if(!s.isFile() || !options.extensions.some(function(ext) {
            return path.extname(f).substr(1).toLowerCase() === ext;
        })) {
            next();
            return;
        }
        var dimensions = sizeOf(f);
        var file = path.parse(f);
        var fileInfo = {
            width : dimensions.width,
            height : dimensions.height,
            dpi :  1,
            scale : {}
        }
        if(file.name.indexOf("@4x")!=-1){
            fileInfo.dpi = 4;
            fileInfo.scale = [{key: 2, scale:0.5},{key: 1, scale:0.25}];
        }else if(file.name.indexOf("@2x")!=-1){
            fileInfo.dpi = 2;
            fileInfo.scale = [{key: 1, scale:0.25}];
        }
        if(fileInfo.dpi!==1){
            var name = file.name.split('@')[0];
            fileInfo.scale.map(function(item){
                var size;
                if (options.roundUp) {
                    size = [Math.ceil(fileInfo.width * item.scale), Math.ceil(fileInfo.height * item.scale)];
                } else {
                    size = [Math.floor(fileInfo.width * item.scale), Math.floor(fileInfo.height * item.scale)];
                }
                file.name = name+options.flagsOut[item.key] ;
                file.base = file.name+file.ext;
                var target = path.format(file);
                //目标图片已存在的不处理
                if(!fs.existsSync(target)){
                    console.log(f.magenta+" >>>> ",file.base.green);
                    gm(f).resize(size[0], size[1])
                        .stream()
                        .pipe(fs.createWriteStream(target));
                }
            });
        }
        next();
    },function(err){
        if(err){
            console.log(err.red);
        }
        console.log("<<<<<<finish retinize images");
    });
};

run();
