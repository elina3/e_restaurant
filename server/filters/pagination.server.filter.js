/**
 * Created by elinaguo on 16/5/12.
 */
'use strict';
var config = require('../config/config');
var mongoLib = require('../libraries/mongoose'),
 publicLib = require('../libraries/public');

exports.requirePagination = function (req, res, next) {
  var currentPage = publicLib.parsePositiveIntNumber(req.query.current_page) || 1; //解析正整数
  var limit = publicLib.parsePositiveIntNumber(req.query.limit) || -1;             //解析正整数
  var skipCount = publicLib.parseNonNegativeIntNumber(req.query.skip_count) || -1; //解析正整数和0
  req.pagination = {
    current_page: currentPage,
    limit: limit,
    skip_count: skipCount
  };
  next();
};