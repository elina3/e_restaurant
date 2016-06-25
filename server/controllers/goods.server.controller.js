/**
 * Created by elinaguo on 16/2/22.
 */
'use strict';
var goodsLogic = require('../logics/goods');
var publicLib = require('../libraries/public');
exports.addNewGoods = function(req, res, next){
  var goodsInfo = req.body.goods_info || req.query.goods_info || {};
  var user = req.user;
  goodsLogic.addGoods(goodsInfo, user, function(err, goods){
    if(err){
      req.err = err;
      return next();
    }

    req.data = {
      goods: goods
    };
    return next();
  });
};

exports.updateGoods = function(req, res, next){
  var goodsId = req.body.goods_id || req.query.goods_id || req.params.goods_id || '';
  var goodsInfo = req.body.goods_info || req.query.goods_info || {};
  var user = req.user;
  goodsLogic.updateGoodsById(goodsId, goodsInfo, user, function(err, success){
    if(err){
      req.err = err;
      return next();
    }

    req.data = {
      success: success
    };
    return next();
  });
};

exports.getGoodsDetail = function(req, res, next){
  var goodsId = req.body.goods_id || req.query.goods_id || '';
  goodsLogic.getGoodsById(goodsId, function(err, goods){
    if(err){
      req.err = err;
      return next();
    }

    req.data = {
      goods: goods
    };
    return next();
  });
};

exports.deleteGoods = function(req, res, next){
  var goodsId = req.body.goods_id || req.query.goods_id || '';
  goodsLogic.deleteGoods(goodsId, function(err, success){
    if(err){
      req.err = err;
      return next();
    }

    req.data = {
      success: success
    };
    return next();
  });
};

exports.getGoodsList = function(req, res, next){
  var currentPage = publicLib.parsePositiveIntNumber(req.query.current_page) || 1; //解析正整数
  var limit = publicLib.parsePositiveIntNumber(req.query.limit) || -1; //解析正整数
  var skipCount = publicLib.parseNonNegativeIntNumber(req.query.skip_count) || -1; //解析正整数和0

  goodsLogic.getGoodsList(currentPage, limit, skipCount, function(err, result){
    if(err){
      req.err = err;
      return next();
    }

    req.data = {
      total_count: result.totalCount,
      limit: result.limit,
      goods_list: result.goodsList
    };
    return next();
  });
};

exports.getOpeningGoodsList = function(req, res, next){
  var currentPage = publicLib.parsePositiveIntNumber(req.query.current_page) || 1; //解析正整数
  var limit = publicLib.parsePositiveIntNumber(req.query.limit) || -1; //解析正整数
  var skipCount = publicLib.parseNonNegativeIntNumber(req.query.skip_count) || -1; //解析正整数和0

  currentPage = parseInt(currentPage);
  skipCount = parseInt(skipCount);
  limit = parseInt(limit);

  goodsLogic.getOpeningGoodsList({goodsType: req.query.type}, currentPage, limit, skipCount, function(err, result){
    if(err){
      req.err = err;
      return next();
    }

    req.data = {
      total_count: result.totalCount,
      limit: result.limit,
      goods_list: result.goodsList
    };
    return next();
  });
};

exports.getFirstFreeMealGoods = function(req, res, next){
  goodsLogic.getFirstFreeMealGoods(function(err, goods){
    if(err){
      req.err = err;
      return next();
    }

    req.data = {
      goods: goods
    };
    return next();
  });
};
