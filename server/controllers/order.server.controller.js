/**
 * Created by elinaguo on 16/4/17.
 */

'use strict';
var orderLogic = require('../logics/order');
var clientLogic = require('../logics/client');
var paymentLogic = require('../logics/payment');
var publicLib = require('../libraries/public');
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
  var cardIdNumber = req.query.card_id_number || '';
  var cardNumber = req.query.card_number || '';
  var clientUsername = req.query.client_username || '';
  var hasDiscount = publicLib.booleanParse(req.query.has_discount);

  var timeRange = JSON.parse(req.query.time_range) || {};

  var defaultStart = new Date('1970-1-1 00:00:00');
  var startTime = !timeRange.startTime ? defaultStart : (new Date(timeRange.startTime) || defaultStart);
  var endTime = !timeRange.endTime ? new Date() : (new Date(timeRange.endTime) || new Date());

  var currentPage = publicLib.parsePositiveIntNumber(req.query.current_page) || 1; //解析正整数
  var limit = publicLib.parsePositiveIntNumber(req.query.limit) || -1; //解析正整数
  var skipCount = publicLib.parseNonNegativeIntNumber(req.query.skip_count) || -1; //解析正整数和0

  var filter = {
    startTime: startTime,
    endTime: endTime,
    cardIdNumber: cardIdNumber,
    cardNumber: cardNumber,
    clientUsername: clientUsername,
    hasDiscount: hasDiscount,
    status: status
  };

  orderLogic.getOrders(filter, currentPage, limit, skipCount, function(err, result){
    if(err){
      return next(err);
    }

    orderLogic.getOrderStatistics(filter, function(err, statistics){
      if(err){
        return next(err);
      }

      req.data = {
        limit: result.limit,
        total_count: result.totalCount,
        orders: result.orders,
        statistics: statistics
      };
      return next();
    });
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

exports.payFreeMealOrder = function(req,res,next){
  var client = req.client;
  var order = req.order;
  var card = req.card;
  var amount = req.body.amount || req.query.amount || 0;
  var method = req.body.method || req.query.method || 'card';

  paymentLogic.pay(client, order, method, card, amount, function(err, payment){
    if(err){
      return next(err);
    }

    orderLogic.setOrderComplete(order, function(err, newOrder){
      if(err){
        return next(err);
      }

      req.data = {
        payment: payment
      };
      return next();
    });
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


exports.getPaymentRecords = function(req, res, next){
  var currentPage = parseInt(req.query.current_page) || parseInt(req.body.current_page) || 1;
  var limit = parseInt(req.query.limit) || parseInt(req.body.limit) || -1;
  var skipCount = parseInt(req.query.skip_count) || parseInt(req.body.skip_count) || -1;

  var startTimeStamp = parseInt(req.query.start_time_stamp) || -1;
  var endTimeStamp = parseInt(req.query.end_time_stamp) || -1;
  var keyword = req.query.keyword || '';
  var filter = {
    startTime: startTimeStamp === -1 ? null : new Date(startTimeStamp),
    endTime: endTimeStamp === -1 ? null : new Date(endTimeStamp),
    keyword: keyword
  }
  paymentLogic.getPayments(filter, {
    currentPage: currentPage,
    limit: limit,
    skipCount: skipCount
  },function(err, result){

  });
};


var mongooseLib = require('../libraries/mongoose');
var appDb = mongooseLib.appDb;
var Order = appDb.model('Order');
var Payment = appDb.model('Payment');
var Card = appDb.model('Card');
var CardHistory = appDb.model('CardHistory');
var CardStatistic = appDb.model('CardStatistic');
exports.recoverTheOrder = function(req, res, next){
  var firmUser = req.firm_user;
  var order = req.order;


  var needAddAmount = req.body.method || '';
  if(needAddAmount !== 'add' && needAddAmount !== 'no'){
    return next({err: {type: 'card_method_null', message: 'the card method is null', zh_message: '是否添加money为空'}});
  }

  Payment.findOne({order: order._id})
    .exec(function(err, payment){
      if(err){
        return next(err);
      }

      if(!payment){
        return next({err: {type: 'payment_not_exist', message: 'the payment is not exist', zh_message: '支付记录不存在'}});
      }

      if(!payment.paid){
        return next({err: {type: 'payment_not_paid', message: 'the payment is not paid', zh_message: '支付记录未支付'}});
      }

      Card.findOne({card_number: payment.card_number, id_number: payment.card_id_number})
        .exec(function(err, card){
          if(err){
            return next(err);
          }

          if(!card){
            return next({err: {type: 'card_not_exist', message: 'the card is not exist', zh_message: '卡记录不存在'}});
          }

          if(card.deleted_status){
            return next({err: {type: 'card_deleted', message: 'the card is deleted', zh_message: '卡记录已删除'}});
          }

          if(card.status !== 'enabled'){
            return next({err: {type: 'card_' + card.status, message: 'the card is ' + card.status, zh_message: '卡记录已'+card.status}});
          }

          if(needAddAmount === 'add'){
            var addAmount = payment.amount;
            if(addAmount > 0){
              card.amount = parseFloat((card.amount + addAmount).toFixed(3));
            }
          }
          card.save(function(err, newCard){
            if(err || !newCard){
              return next(err);
            }

            payment.deleted_status = true;
            payment.save(function(err, newPayment){
              if(err || !newPayment){
                return next(err);
              }

              order.deleted_status = true;
              order.save(function(err, newOrder){
                if(err || !newOrder){
                  return next(err);
                }

                req.data = {
                  order: newOrder,
                  payment: newPayment,
                  card: newCard
                };
                return next();
              });
            });

          });
        });
    });
};


exports.updateTimeTag = function(req, res, next){
  orderLogic.updateTimeTag(function(err){
    if(err){
      return next(err);
    }
    req.data = {
      success: true
    };
    return next();
  });
};

exports.getOrderStatisticByTimeTagGroup = function(req, res, next){
  var timeRange = {};
  try{
    timeRange = JSON.parse(req.query.time_range || '') || {};
  }catch(e){}

  var defaultStart = new Date('1970-1-1 00:00:00');
  var startTime = !timeRange.startTime ? defaultStart : (new Date(timeRange.startTime) || defaultStart);
  var endTime = !timeRange.endTime ? new Date() : (new Date(timeRange.endTime) || new Date());

  orderLogic.getOrderStatisticByTimeTagGroup({
    startTime: startTime,
    endTime: endTime
  }, function(err, result){
      if(err){
        return next(err);
      }

    req.data = {
      order_statistic: result,
      begin_time: startTime,
      end_time: endTime
    };
    return next();
  });
};