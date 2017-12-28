/*
    branches
    Create SVN branch for trunk
    @Author: quanwei1
    params: --branchname 要创建的分支名称
            --copath     分支co的路径，默认是branches
    Example: npm run branches --branchname=testBranch --copath=/test/123
*/

var co = require('co');
var colors = require('colors');
var path = require('path');
var svn = require('./utils/svn');
var root = process.cwd();
var argv = {
    branchName : process.env.npm_config_branchname || '',
    svnCoPath  : process.env.npm_config_copath || ''
};
var config = require(path.join(root, 'config', 'project'));

function checkBranchName() {
    if (!argv.branchName) {
        console.log('请输入分支名'.bgBlack.red);
        process.exit(1);
    }
}

function getTrunkPath() {
    var tempSvnArr = config.svn.split('/');
    var delIndex = tempSvnArr.indexOf('trunk');

    tempSvnArr.splice(delIndex + 1, tempSvnArr.length - delIndex);
    return tempSvnArr.join('/');
}

function getBranchPath() {
    var tempSvnArr = config.svn.split('/');
    var delIndex = tempSvnArr.indexOf('trunk');

    tempSvnArr.splice(delIndex, tempSvnArr.length - delIndex);
    var branchPath = [tempSvnArr.join('/'), 'branches', argv.branchName].join('/');
    return branchPath;
}

function getSvnCoPath() {
    if (argv.svnCoPath) {
        var coPath = path.resolve(root, argv.svnCoPath);
    } else {
        var tempCoArr = root.split('/');
        var delIndex = tempCoArr.indexOf('trunk');
        tempCoArr.splice(delIndex, tempCoArr.length - delIndex);
        var coPath = [tempCoArr.join('/'), 'branches', argv.branchName].join('/');
    }

    return coPath;
}

co(function*() {
    console.log('START TO CREATE BRANCH FOR TRUNK'.green);
    console.log('=====================================');

    checkBranchName();

    var trunkSvn = getTrunkPath();
    var branchSvn = getBranchPath();

    var coPath = getSvnCoPath();
    var res = yield svn.checkout(branchSvn, coPath);

    if (res === -1) {
        yield svn.copy(trunkSvn, branchSvn);
    
        yield svn.checkout(branchSvn, coPath);
    }
    console.log('CREATED BRANCH >>>>> '.red + argv.branchName + ' <<<<<Done!'.red);
    console.log('SVN BRANCH PATH '.green + branchSvn);
    process.exit(0);
}).catch(function(e){
    console.log('packing error: ' + e.message + "\nstackinfo:".red + e.stack.bgRed);
    process.exit(1);
});