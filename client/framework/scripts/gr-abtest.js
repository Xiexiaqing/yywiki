var fs = require('fs');
var path = require('path');
var common = require("./utils/common");
var _ = require('lodash');

var root = process.argv.pop();
var gProjectPath = path.resolve(path.join(root + '/../', 'tmp_abtest'));
var config = require(path.join(root, 'config/project'));
var co = require('co');
var svn = require('./utils/svn');

function *checkOutGreyProject() {

    //the svn path of grey product
    var gSvn = config.greySvnPath;

    //创建临时文件夹用于下载上传SVN代码
    console.log('');
    console.log('MAKING TEMPORARY FOLDERS......');
    console.log('TEMP FOLDERS >>> ' + gProjectPath);
    console.log('=====================================');

    common.deleteFolderRecursive(gProjectPath);
    yield common.exec('mv ' + root + ' ' + gProjectPath);

    console.log('');
    console.log('MAKING TEMPORARY FOLDERS DONE');
    console.log('');

    //svn co the code of grey project
    yield svn.export(gSvn, root);

    return;
}

function getCombineTpl(tpl, gtpl) {
    console.log('');
    console.log("DO COMBINE TPL");
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
        gtpl,
        '<?php else:?>',
        tpl,
        '<?php endif;?>'
    ].join('\n');

    console.log('');
    console.log("COMBINE TPL DONE");
    console.log('=====================================');

    return ctpl;
}

co(function*() {
    //start
    console.log('START BULID FOR GREY RELEASE');
    console.log('=====================================');

    try {
        process.chdir('..');
        yield checkOutGreyProject();
    } catch(e) {
        console.log(e);
        process.exit(1);
    }

    //build grey project
    try {
        //test
        yield common.exec("../framework/node_modules/eslint/bin/eslint.js --c ../framework/.eslintrc --ignore-pattern '**/dist/**' --ignore-pattern '**/_tmp/**' --ignore-pattern '**/_doc/**' --ignore-pattern '**/mocks/**' --ignore-pattern '**/node_modules/**' " + root);
        //build
        yield common.exec("node ../framework/scripts/gr.js " + root);
        yield common.exec("DEBUG=false ABTEST=true BUNDLE=client NODE_ENV=production ../framework/node_modules/webpack/bin/webpack.js --config ../framework/webpack/prod.config.babel.js --display-error-details --progress " + root);

        var tmp = path.resolve(path.join(root, '../tmp_abtest_tmp'));
        yield common.exec('mv ' + root + ' ' + tmp);
        yield common.exec('mv ' + gProjectPath + ' ' + root);
        yield common.exec('mv ' + tmp + ' ' + gProjectPath);
        console.log('')
        console.log('GREY PRODUCT BUILD DONE');
        console.log('=====================================');
    } catch (e) {
        common.deleteFolderRecursive(root);
        yield common.exec('mv ' + gProjectPath + ' ' + root);
        console.log(e)
        console.log(e.stack)
        process.exit(1);
    }

    try {
        //get tpl of both projects
        var tpl = fs.readFileSync(root + '/dist/' + 'index.html', 'binary');
        var greytpl = fs.readFileSync(gProjectPath + '/dist/' + 'index.html', 'binary');

        // build combine tpl
        var combineTpl = getCombineTpl(tpl, greytpl);

        yield common.exec('mv ' + gProjectPath + '/dist/css/* ' + root + '/dist/css');
        common.deleteFolderRecursive(gProjectPath + '/dist/css/');

        yield common.exec('mv ' + gProjectPath + '/dist/js/* ' + root + '/dist/js');
        common.deleteFolderRecursive(gProjectPath + '/dist/js/');

        yield common.exec('mv ' + gProjectPath + '/dist/image/* ' + root + '/dist/image');
        common.deleteFolderRecursive(gProjectPath + '/dist/image/');

        yield common.exec('mv ' + gProjectPath + '/dist/* ' + root + '/dist/');

        //save combine tpl
        fs.writeFileSync(root + '/dist/' + 'index.html', combineTpl);
        fs.writeFileSync(root + '/dist/' + 'origin.html', tpl);
        fs.writeFileSync(root + '/dist/' + 'abtest.html', greytpl);

        common.deleteFolderRecursive(gProjectPath);
        process.chdir(root);

    } catch(e) {
        console.log(e);
        process.exit(1);
    }

    process.exit(0);
});