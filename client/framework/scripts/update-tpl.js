/*
 * 提交模板文件给后端
 */

'use strict';

var colors = require('colors');
var fs = require('fs');
var path = require('path');
var co = require('co');
var common = require('./utils/common');
var svn = require('./utils/svn');
var root = process.cwd();
var config = require(path.join(root, 'config', 'project'));
var dirLists = root.split(path.sep);
var suffix = dirLists.pop() || dirLists.pop();

function curentProductInfo() {
    var baseSvn = 'https://svn1.intra.sina.com.cn/weibo2/weibo.com/subcode/ent_platform/subcode/fp_tpl/';
    var branch = config.tplBranch + '/';

    //项目模板放置的目录
    var tplSvn = baseSvn + branch;
    
    // 创建临时文件夹用于下载上传SVN代码
    var to = path.join(root, 'tmpTpl'); //临时代码目录 model
    var from = path.join(root, 'dist');
    console.log('');
    console.log('MAKING TEMPORARY FOLDERS......');
    console.log('TEMP FOLDERS >>> ' + to);
    console.log('=====================================');

    common.deleteFolderRecursive(to);
    common.mkdirsSync(to);

    console.log('');
    console.log('MAKING TEMPORARY FOLDERS DONE');
    console.log('');

    return {
        'tplSvnPATH': tplSvn,
        'buildCode': from,
        'diskTplCode': to
    };
}

co(function*() {
    //start
    console.log('START UPDATE MODEL');
    console.log('=====================================');

    var buildTplName = 'index.html';
    var upTypePath = process.argv.pop().indexOf('dev') === -1 ? 'production' : 'development';
    //create temp folder
    var proinfo = curentProductInfo();

    //svn co code
    yield svn.checkout(proinfo.tplSvnPATH, proinfo.diskTplCode);

    //如果没有目录则创建新的svn目录
    if (config.tplBranch != 'trunk') {
        var branches = yield svn.ls('https://svn1.intra.sina.com.cn/weibo2/weibo.com/subcode/ent_platform/subcode/fp_tpl/branches');
        var branchArr = config.tplBranch.split('/'); //分解config.tplBranch参数的临时数组
        var branchName = branchArr[branchArr.indexOf('branches') + 1];

        if (branches.indexOf(branchName) === -1) {
            console.log('THIS PROJECT DIDN\'T CREATED CATELOG FOR TPL!');
            console.log('');
            console.log('CREATE NEW CATELOG..........');
            console.log('');

            var branchPath = 'https://svn1.intra.sina.com.cn/weibo2/weibo.com/subcode/ent_platform/subcode/fp_tpl/branches/' + branchName;
            yield svn.copy(
                'https://svn1.intra.sina.com.cn/weibo2/weibo.com/subcode/ent_platform/subcode/fp_tpl/trunk', 
                branchPath
            );
            console.log('');
            console.log('CREATE NEW CATELOG DONE..........');
            
            yield svn.checkout(branchPath, proinfo.diskTplCode);
        }
    }
    
    //read build tpl
    if (upTypePath === 'development') { //development
        var file = fs.readFileSync(path.join(root, 'template.html'), 'binary');
    } else { //production
        var file = fs.readFileSync(path.join(proinfo.buildCode, buildTplName), 'binary');
    }
    
    //replace tpl file
    config.tplSvn.map((item, index)=>{
        //匹配后端模板名称后的模板路径
        var forPhpTpl = path.join(
                proinfo.diskTplCode, 
                upTypePath, 
                item, 
                config.tplName
            );
        fs.writeFileSync(forPhpTpl, file, 'binary');
    });
    
    // svn commit
    try {
        yield svn.add(path.join(proinfo.diskTplCode, '*'));
        yield svn.commit(proinfo.diskTplCode);
        console.log('TEMPLATE COMMIT TO '.green + proinfo.tplSvnPATH);
    } catch(e) {
        console.log(e)
        console.log(e.stack)
        yield svn.cleanup(dst);
        process.exit(1);
    }

    common.deleteFolderRecursive(proinfo.diskTplCode);
    process.exit(0);

});