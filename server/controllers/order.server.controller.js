/**
 * Created by elinaguo on 16/4/17.
 */

'use strict';
var orderLogic = require('../logics/order');
var clientLogic = require('../logics/client');
var paymentLogic = require('../logics/payment');
var goodsLogic = require('../logics/goods');
exports.generateOrder = function(req, res, next){
  var client = req.client;
  var orderInfo = req.body.order_info || req.query.order_info || null;

  orderInfo.in_store_deal = orderInfo.in_store_deal.toString().toLowerCase() === 'true' ? true: false;
  orderLogic.createOrder(orderInfo, client, function(err, newOrder){
    if(err){
      return next(err);
    }

    clientLogic.clearGoodsFromCart(client, orderInfo.goods_infos, function(err, newClient){
      if(err){
        return next(err);
      }

      if(orderInfo.in_store_deal){
        req.data = {
          order: newOrder,
          client: newClient
        };
        return next();
      }

      clientLogic.updateContact(newClient, orderInfo.contact, function(err, newClientContact){
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
  });
};

exports.getOrderDetail = function(req, res, next){
  req.data = {order: req.order};
  return next();
};

exports.getMyOrders  = function(req, res, next){
  var client = req.client;
  var currentPage = parseInt(req.query.current_page) || parseInt(req.body.current_page) || 1;
  var limit = parseInt(req.query.limit) || parseInt(req.body.limit) || -1;
  var skipCount = parseInt(req.query.skip_count) || parseInt(req.body.skip_count) || -1;

  orderLogic.getMyOrders(client, currentPage, limit, skipCount, function(err, result){
    if(err){
      return next(err);
    }

    req.data = {
      limit: result.limit,
      total_count: result.totalCount,
      orders: result.orders
    };
    return next();
  });
};

exports.getOrders = function(req, res, next){
  var user = req.user;
  var status = req.query.status || '';
  var currentPage = parseInt(req.query.current_page) || parseInt(req.body.current_page) || 1;
  var limit = parseInt(req.query.limit) || parseInt(req.body.limit) || -1;
  var skipCount = parseInt(req.query.skip_count) || parseInt(req.body.skip_count) || -1;

  orderLogic.getOrders(status, currentPage, limit, skipCount, function(err, result){
    if(err){
      return next(err);
    }

    req.data = {
      limit: result.limit,
      total_count: result.totalCount,
      orders: result.orders
    };
    return next();
  });
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
    return next();
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
    return next();
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
    return next();
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

exports.getTodayAmount = function(req, res, next){
  paymentLogic.getTodayAmount(function(err, result){
    if(err){
      return next(err);
    }

    req.data = result;
    return next();
  });
};
