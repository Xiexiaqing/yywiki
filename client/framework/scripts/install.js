var path = require('path');
var common = require('./utils/common');
var svn = require('./utils/svn');
var cmd = 'cd ../../framework2 && npm install';

console.log('NPM INSTALL ......');
console.log('=====================================');

var cp = require('child_process');
var ex = cp.exec(cmd, {}, function() {
	console.log('');
    console.log('NPM INSTALL DONE');
    console.log('');
	process.exit(0);
});

process.stdin.pipe(ex.stdin);
ex.stdout.pipe(process.stdout);
ex.stderr.pipe(process.stderr);