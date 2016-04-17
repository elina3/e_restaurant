/**
 * Created by elinaguo on 16/4/17.
 */
'use strict';
var orderError = require('../errors/order');
var orderLogic = require('../logics/order');

exports.requireOrder = function(req, res, next){
  var orderId = req.body.order_id || req.query.order_id || '';

  if(!orderId){
    return res.send({err: orderError.order_id_null_error});
  }

  orderLogic.getOrderByOrderId(orderId, function(err, order){
    if(err){
      return next(err);
    }

    if(!order){
      return next({err: orderError.order_not_exist});
    }

    req.order = order;
    next();
  });
};


exports.requireOrderDetail = function(req, res, next){
  var orderId = req.body.order_id || req.query.order_id || '';

  if(!orderId){
    return res.send({err: orderError.order_id_null_error});
  }

  orderLogic.getOrderDetailByOrderId(orderId, function(err, order){
    if(err){
      return next(err);
    }

    if(!order){
      return next({err: orderError.order_not_exist});
    }

    req.order = order;
    next();
  });
};


exports.requireGoodsOrder = function(req, res, next){
  var goodsOrderId = req.body.goods_order_id || req.query.goods_order_id || '';

  if(!goodsOrderId){
    return res.send({err: orderError.goods_order_id_null_error});
  }

  orderLogic.getOrderByOrderId(goods_order_id, function(err, goodsOrder){
    if(err){
      return next(err);
    }

    if(!goodsOrder){
      return next({err: orderError.goods_order_not_exist});
    }

    req.goods_order = goodsOrder;
    next();
  });
};
