'use strict';

process.env.NODE_ENV = 'test';

var gulp = require('gulp');
var less = require('gulp-less');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');

var webJsFiles = [
    './js/*.js'
];

gulp.task('web-less', function () {
    console.log('less合并');
    return gulp.src([
        './lesses/**/*.less'])
        .pipe(less())
        .pipe(gulp.dest('./css'));
});

gulp.task('web-jshint', function () {
    return gulp.src(webJsFiles)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('web', ['web-less', 'web-jshint']);
