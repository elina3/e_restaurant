'use strict';


var gulp = require('gulp');
var less = require('gulp-less');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');

var serverJsFiles = ['server.js', './**/*.js', '!./libraries/**', '!./node_modules/**', '!./coverage/**'];
var mochaJsFiles = ['./tests/**/*.js'];

gulp.task('server-jshint', function () {
    return gulp.src(serverJsFiles)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('server-test', function (done) {
    gulp.src(serverJsFiles)
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
        .on('finish', function () {
            gulp.src(mochaJsFiles)
                .pipe(mocha({
                    reporter: 'spec',
                    require: require('./server')
                }))
                .pipe(istanbul.writeReports({
                    reporters: ['lcov']
                }))
                .on('end', function () {
                    done();
                    process.exit();
                });
        });
});


gulp.task('server', ['server-jshint']);

process.env.NODE_ENV = 'test';
gulp.task('test', ['server-jshint', 'server-test']);
