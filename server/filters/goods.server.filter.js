/**
 * Created by elinaguo on 16/4/17.
 */
'use strict';
var goodsError = require('../errors/goods');
var goodsLogic = require('../logics/goods');

exports.requireGoods = function(req, res, next){
  var goodsId;
  goodsId = req.body.goods_id || req.query.goods_id;

  if(!goodsId){
    return res.send({err: goodsError.goods_id_null});
  }

  goodsLogic.getGoodsById(goodsId, function(err, goods){
    if(err){
      return next(err);
    }

    if(!goods){
      return next({err: goodsError.goods_not_exist});
    }

    req.goods = goods;
    next();
  });
};
