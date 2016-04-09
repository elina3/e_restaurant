'use strict';

process.env.NODE_ENV = 'test';

var gulp = require('gulp');
var less = require('gulp-less');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var jsconcat = require('gulp-concat');
var jshint = require('gulp-jshint');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var ngmin = require('gulp-ngmin');
var stripDebug = require('gulp-strip-debug');

var webJsFiles = [
    './www/app.js',
    './www/config/**/*.js',
    './www/supports/**/*.js',
    './www/services/**/*.js',
    './www/errors/**/*.js',
    './www/events/**/*.js',
    './www/interceptors/**/*.js',
    './www/filters/**/*.js',
    './www/controllers/**/*.js',
    './www/directives/**/*.js',
    './www/constant/**/*.js'
];
//var appForWebCopy = [
//    'z_app/www/css/**/*.*',
//    'z_app/www/dist/**/*.*',
//    'z_app/www/img/**/*.*',
//    'z_app/www/lib/**/*.*',
//    'z_app/www/templates/**/*.*',
//    'z_app/www/index.html'
//];
//
//gulp.task('app-copy', function () {
//    console.log('正在生成web版的app');
//    return gulp.src(appForWebCopy)
//        .pipe(filecopy('../z_web/'));
//});
gulp.task('web-less', function () {
    console.log('less合并');
    return gulp.src([
        './www/lesses/**/*.less',
        './www/directives/**/*.less'])
        .pipe(concat('z.less'))
        .pipe(less())
        .pipe(gulp.dest('./www/dist/css'));
});


gulp.task('web-less-minify', function () {
    console.log('less合并并压缩');
    return gulp.src([
        './www/lesses/**/*.less',
        './www/directives/**/*.less'])
        .pipe(concat('z.less'))
        .pipe(less())
        .pipe(minifyCss())
        .pipe(gulp.dest('./www/dist/css'));
});


gulp.task('js-concat', function () {
    console.log('js合并');
    return gulp.src(webJsFiles)
        .pipe(jsconcat('z.js'))
        .pipe(gulp.dest('./www/dist/js'));
});

gulp.task('js-concat-minify', function () {
    console.log('js合并并压缩');
    return gulp.src(webJsFiles)
        .pipe(jsconcat('z.js'))
        .pipe(ngmin())
        .pipe(stripDebug())
        .pipe(uglify())
        .pipe(gulp.dest('./www/dist/js'));
});

gulp.task('web-jshint', function () {
    return gulp.src(webJsFiles)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('web', ['web-less', 'js-concat', 'web-jshint']);
gulp.task('web-release', ['web-less-minify', 'js-concat-minify', 'web-jshint']);
