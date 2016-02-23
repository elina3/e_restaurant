/**
 * Created by elinaguo on 16/2/22.
 */
'use strict';
exports.addNewGoods = function(req, res, next){
  req.data = {
    add: true,
    success: true
  };
  return next();
};

exports.updateGoods = function(req, res, next){
  req.data = {
    update: true,
    success: true
  };
  return next();
};

exports.getGoodsDetail = function(req, res, next){
  req.data = {
    get: true,
    success: true
  };
  return next();
};

exports.deleteGoods = function(req, res, next){
  req.data = {
    delete: true,
    success: true
  };
  return next();
};
