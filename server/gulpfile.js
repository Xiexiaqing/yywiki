/*
 * 暂时用于调试使用
 */

var gulp = require('gulp'),
nodemon = require('gulp-nodemon'),
watch = require('gulp-watch'),
fs = require('fs');

gulp.task('nodemon', function () {
nodemon({ script: 'yywiki.js', stdout: true, readable: true })
    .on('readable', function() {
        this.stdout.pipe(fs.createWriteStream('./log/runtime.log'));
        this.stderr.pipe(fs.createWriteStream('./log/err.log'));
    })
    .on('restart');
});

// Rerun the task when a file changes
gulp.task('watch', function() {
gulp.src(['../config/*.js', 'src/models/*.js', 'src/controllers/*.js', 'src/common/*.js', 'src/views/*.pug'], { read: true })
    .pipe(watch({ emit: 'all' }));
});

gulp.task('default', ['nodemon', 'watch']);