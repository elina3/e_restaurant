/**
 * Created by elinaguo on 16/2/22.
 */
'use strict';
var goodsLogic = require('../logics/goods');
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
  var currentPage = req.query.current_page || req.body.current_page || 1;
  var limit = req.query.limit || req.body.limit || -1;
  var skipCount = req.query.skip_count || req.body.skip_count || -1;
  currentPage = parseInt(currentPage);
  skipCount = parseInt(skipCount);
  limit = parseInt(limit);

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
