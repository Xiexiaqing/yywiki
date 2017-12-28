/*
 * 前端代码打包、编译、合并（带灰度分支）
 */

'use strict';

var fs = require('fs');
var path = require('path');
var common = require("./utils/common");
var webpackBuild = require('./utils/webpack-build');
var _ = require('lodash');
var co = require('co');
var colors = require('colors');
var root = process.cwd();
var config = require(path.join(root, 'config', 'project'));

function getCombineTpl(tpl, tpltest) {
    console.log('');
    console.log("COMBINING TPL......".green);
    console.log('=====================================');

    var rules = {
        uid:'',
        percet:''
    }

    if (config.greyType === 'uid') {
        var rulesArr = ['(', config.greyRules.join(','), ')'];

        rules.uid = [
            '<?php ',
                '$_fe_grey_uidArr = array' + rulesArr.join('') + ';',
                'if ($g_viewer && (in_array($g_viewer->id, $_fe_grey_uidArr))): ',
            '?>'
        ].join('');

    } else if (config.greyType === 'percent') {
        rules.percent = [
            '<?php ',
                'if (rand(1, 100) <= ' + config.greyRules + '): ',
            '?>'
        ].join('');
    }

    // combine tpl
    var ctpl = [
        rules[config.greyType],
        tpltest,
        '<?php else:?>',
        tpl,
        '<?php endif;?>'
    ].join('\n');

    console.log('');
    console.log("COMBINING TPL DONE".green);
    console.log('')

    return ctpl;
}

co(function*() {
    var svnonline = config.svn;
    var svnabtest = config.greySvnPath;

    // 创建临时文件夹用于下载上传SVN代码
    var pack = path.join(root, '_repochpack');
    var dist = path.join(root, 'dist');
    var abtest_dist = path.join(root, 'abtest_dist');

    yield webpackBuild(root, pack, dist, svnonline);
    yield webpackBuild(root, pack, abtest_dist, svnabtest, { ABTEST: true });

    try {
        //get tpl of both projects
        var tpl = fs.readFileSync(path.join(dist, 'index.html'), 'binary');
        var tpltest = fs.readFileSync(path.join(abtest_dist, 'index.html'), 'binary');
        var tplcombine = getCombineTpl(tpl, tpltest);
        common.copyFileRecursive(abtest_dist, dist);

        fs.writeFileSync(path.join(dist, 'index.html'), tplcombine);
        fs.writeFileSync(path.join(dist, 'origin.html'), tpl);
        fs.writeFileSync(path.join(dist, 'abtest.html'), tpltest);

        common.deleteFolderRecursive(abtest_dist);
    } catch(e) {
        console.log(e);
        process.exit(1);
    }
    process.exit(0);
}).catch(function(e){
    console.log('packing error: ' + e.message + "\nstackinfo:".red + e.stack.bgRed);
    process.exit(1);
});

