'use strict';
var async = require('async');

var supermarketOrderLogic = require('../logics/supermarket_order'),
  milkOrderLogic = require('../logics/milk_order'),//牛奶棚的订单逻辑，用于获取用户在牛奶棚的消费
  clientLogic = require('../logics/client'),
  cardLogic = require('../logics/card');

var publicLib = require('../libraries/public'),
  supermarketOrderError = require('../errors/v3_supermaket_order');


var supermarketAmountLimit = 200 * 100, //默认100元（单位：分）//需求更新：超市限制200。（2021／4／29） //超市和牛奶棚共同限制200（2021／06／21）
  supermarketDiscountForStaff = 1; //超市员工折扣取消（2021／4／29）

function getError(err, value){
  var newError = JSON.parse(JSON.stringify(err));
  newError.zh_message = newError.zh_message.replace('{{value1}}', value);
  newError.message = newError.zh_message.replace('{{value1}}', value);
  return newError;
}

//超市消费：
//专家卡：月消费限制200（实际金额），无折扣，参考supermarketAmountLimit字段 超市和牛奶棚共同限制200
//员工卡：月消费限制200（实际金额），无折扣
//普通卡：不能消费
exports.generateOrder = function(req, res, next){
  var client = req.client;
  var card = req.card;
  // if(card.type === 'expert'){
  //   return next({err: supermarketOrderError.expert_not_support});//专家卡不支持消费  （改过的需求）(去掉的需求：2018-8-2 20：55)
  // }
  if(card.type === 'normal'){
    return next({err: supermarketOrderError.normal_not_support});//普通卡不支持消费  （改过的需求:2018-8-2 20:55）
  }

  var amount = publicLib.parseIntNumber(req.body.amount);//单位：分
  if(amount === null || amount <= 0){
    return next({err: supermarketOrderError.amount_invalid});
  }

  var actualAmount = amount;
  async.auto({
    getCurrentConsumptionAmount: function(autoCallback){
      if(card.type !== 'staff'){//只有普通员工和专家没有折扣，可以先判断卡内余额是否充足
        if(card.amount * 100 < amount){
          return autoCallback({err: getError(supermarketOrderError.card_amount_not_enough, card.amount)});
        }
      }

      if(card.type === 'normal'){//普通员工没有月消费限制
        return autoCallback();
      }

      if(card.type === 'staff'){//只有员工有折扣，专家按照原价
        actualAmount = publicLib.parseIntNumber(amount * supermarketDiscountForStaff);
        if(actualAmount === null || actualAmount < 0){
          return autoCallback({err: supermarketOrderError.amount_invalid});
        }
      }

      supermarketOrderLogic.getCurrentConsumptionAmount(card, function(err, currentConsumptionAmount){
        if(err){
          return autoCallback(err);
        }

        milkOrderLogic.getCurrentConsumptionAmount(card, function(err, currentMilkAmount){
          if(err){
            return autoCallback(err);
          }

          //消费限制(牛奶棚+超市一共的消费金额)
          var currentAmount = currentConsumptionAmount + currentMilkAmount;
          if(currentAmount + amount > supermarketAmountLimit){
            return autoCallback({err: getError(supermarketOrderError.supermarket_consumption_amount_not_enough, (supermarketAmountLimit - currentAmount)/100)});
          }

          if(actualAmount > card.amount * 100){
            return autoCallback({err: getError(supermarketOrderError.supermarket_consumption_card_amount_not_enough, card.amount)});
          }

          return autoCallback(null, currentAmount);
        });
      });
    },
    createSupermarketOrder: ['getCurrentConsumptionAmount', function(autoCallback){
      supermarketOrderLogic.createSupermarketOrder({
        description: req.body.description || '',
        amount: amount,
        actual_amount: actualAmount
      }, client, card, function(err, newOrder){
        return autoCallback(err, newOrder);
      });
    }],
    payByCard: ['createSupermarketOrder', function(autoCallback, results){
      cardLogic.paySupermarketOrder(client, card, results.createSupermarketOrder, actualAmount / 100, function(err, newCard){
        return autoCallback(err, newCard);
      });
    }],
    updateSupermarketOrderPaid: ['createSupermarketOrder', 'payByCard', function(autoCallback, results){
      var payTime = new Date();
      results.createSupermarketOrder._doc.paid = true;
      results.createSupermarketOrder._doc.pay_time = payTime;
      supermarketOrderLogic.updateSupermarketOrderPaid(results.createSupermarketOrder._id, payTime, function(err){
        return autoCallback(err);
      });
    }]
  }, function(err, results){
    if(err){
      return next(err);
    }

    req.data = {
      success: true,
      card_type: card.type,
      amount: amount,
      actual_amount: actualAmount,
      //卡内余额（员工和专家会显示当月余额）
      supermarket_current_balance: (card.type === 'staff' || card.type === 'expert') ? supermarketAmountLimit - (results.getCurrentConsumptionAmount + amount) : -1,
      card_balance: results.payByCard.amount,
      order: results.createSupermarketOrder
    };
    return next();
  });
};

exports.getSupermarketOrdersByPagination = function(req, res, next){
  var timeRange = {};
  try{
    timeRange = JSON.parse(req.query.time_range || '') || {};
  }catch(e){}

  var defaultStart = new Date('1970-1-1 00:00:00');
  var startTime = !timeRange.startTime ? defaultStart : (new Date(timeRange.startTime) || defaultStart);
  var endTime = !timeRange.endTime ? new Date() : (new Date(timeRange.endTime) || new Date());
  var filter = {
    start_time: startTime,
    end_time: endTime,
    card_id_number: req.query.card_id_number,
    card_number: req.query.card_number,
    has_discount: publicLib.booleanParse(req.query.has_discount)
  };
  supermarketOrderLogic.getSupermarketOrdersByPagination(filter, req.pagination, function(err, result){
    if(err){
      return next(err);
    }

    req.data = {
      total_count: result.totalCount,
      limit: result.limit,
      supermarket_orders: result.supermarketOrders,
      statistics: result.statistics
    };
    return next();
  });
};
