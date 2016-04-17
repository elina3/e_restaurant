/**
 * Created by elinaguo on 16/4/17.
 */

'use strict';
var orderLogic = require('../logics/order');
var paymentLogic = require('../logics/payment');
exports.generateOrder = function(req, res, next){
  var client = req.client;
  var orderInfo = req.body.order_info || req.query.order_info || null;

  orderLogic.createOrder(orderInfo, client, function(err, newOrder){
    if(err){
      return next(err);
    }

    client.clearGoodsFromCart(orderInfo.goods_infos, function(err, newClient){
      if(err){
        return next(err);
      }

      req.data = {
        order: newOrder,
        client: newClient
      };
      return next();
    });
  });
};

exports.getOrderDetail = function(req, res, next){
  req.data = {order: req.order};
  return next();
};

exports.payOrder = function(req, res, next){
  var client = req.client;
  var order = req.order;
  var card = req.card;
  var amount = req.body.amount || req.query.amount || 0;
  var method = req.body.method || req.query.method || 'card';

  paymentLogic.pay(client, order, method, card, amount, function(err, payment){
    if(err){
      return next(err);
    }

    req.data = {
      payment: payment
    };
    return next();
  });
};

exports.deleteOrder = function(req, res, next){
  var order = req.order;
  orderLogic.deleteOrder(order, function(err, newOrder){
    if(err){
      return next();
    }

    req.data = {
      order: newOrder ? true : false
    };
  });
};

exports.orderBeginToCook = function(req, res, next){
  var order = req.order;
  orderLogic.setOrderCooking(order, function(err, newOrder){
    if(err){
      return next(err);
    }
    req.data = {
      success: newOrder ? true: false
    };
  });
};

exports.orderBeginToTransport = function(req, res, next){
  var order = req.order;
  orderLogic.setOrderTransporting(order, function(err, newOrder){
    if(err){
      return next(err);
    }
    req.data = {
      success: newOrder ? true: false
    };
  });
};

exports.orderComplete = function(req, res, next){
  var order = req.order;
  orderLogic.setOrderComplete(order, function(err, newOrder){
    if(err){
      return next(err);
    }
    req.data = {
      success: newOrder ? true: false
    };
  });
};

exports.setGoodsOrderCooking = function(req, res, next){
  var goodsOrder = req.goods_order;
  orderLogic.setGoodsOrderCooking(goodsOrder, function(err, result){
    if(err){
      return next(err);
    }
    req.data = {
      success: result ? true: false
    };
  });
};

exports.setGoodsOrderComplete = function(req, res, next){
  var goodsOrder = req.goods_order;
  orderLogic.setGoodsOrderComplete(goodsOrder, function(err, result){
    if(err){
      return next(err);
    }
    req.data = {
      success: result ? true: false
    };
  });
};
