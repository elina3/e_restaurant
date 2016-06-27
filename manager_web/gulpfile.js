'use strict';

process.env.NODE_ENV = 'test';

var gulp = require('gulp');
var less = require('gulp-less');
var concat = require('gulp-concat');
var jsconcat = require('gulp-concat');
var jshint = require('gulp-jshint');

var webJsFiles = [
    'www/',
    'www/config/**/*.js',
    'www/services/**/*.js',
    'www/constant/**/*.js',
    'www/supports/**/*.js',
    'www/errors/**/*.js',
    'www/events/**/*.js',
    'www/interceptors/**/*.js',
    'www/filters/**/*.js',
    'www/controllers/**/*.js',
    'www/directives/**/*.js'
];

gulp.task('app-less', function () {
    console.log('正在合并并编译less');
    return gulp.src([
        'www/lesses/**/*.less',
        'www/directives/**/*.less'])
      .pipe(concat('e-restaurant.less'))
      .pipe(less())
      .pipe(gulp.dest('www/dist/css'));
});

gulp.task('js-concat', function () {
    console.log('正在合并并编译js');
    return gulp.src(webJsFiles)
      .pipe(jsconcat('e-restaurant.js'))
      .pipe(gulp.dest('www/dist/js'));
});

gulp.task('web-jshint', function () {
    return gulp.src(webJsFiles)
      .pipe(jshint('.jshintrc'))
      .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('web', ['app-less', 'js-concat', 'web-jshint']);
