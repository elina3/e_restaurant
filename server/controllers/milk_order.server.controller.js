'use strict';
var async = require('async');

var milkOrderLogic = require('../logics/milk_order'),
  clientLogic = require('../logics/client'),
  cardLogic = require('../logics/card');

var publicLib = require('../libraries/public'),
  milkOrderError = require('../errors/v3_milk_order');


var supermarketAmountLimit = 200 * 100, //默认100元（单位：分）//需求更新：超市限制200。（2021／4／29）
  supermarketDiscountForStaff = 1; //超市员工折扣取消（2021／4／29）

function getError(err, value){
  var newError = JSON.parse(JSON.stringify(err));
  newError.zh_message = newError.zh_message.replace('{{value1}}', value);
  newError.message = newError.zh_message.replace('{{value1}}', value);
  return newError;
}

//牛奶棚消费：
//专家卡：月消费限制100（实际金额），无折扣
//员工卡：月消费限制200（实际金额），无折扣
//普通卡：不能消费
exports.generateOrder = function(req, res, next){
  var client = req.client;
  var card = req.card;
  // if(card.type === 'expert'){
  //   return next({err: milkOrderError.expert_not_support});//专家卡不支持消费  （改过的需求）(去掉的需求：2018-8-2 20：55)
  // }
  if(card.type === 'normal'){
    return next({err: milkOrderError.normal_not_support});//普通卡不支持消费  （改过的需求:2018-8-2 20:55）
  }

  var amount = publicLib.parseIntNumber(req.body.amount);//单位：分
  if(amount === null || amount <= 0){
    return next({err: milkOrderError.amount_invalid});
  }

  var actualAmount = amount;
  async.auto({
    getCurrentConsumptionAmount: function(autoCallback){
      if(card.type !== 'staff'){//只有普通员工和专家没有折扣，可以先判断卡内余额是否充足
        if(card.amount * 100 < amount){
          return autoCallback({err: getError(milkOrderError.card_amount_not_enough, card.amount)});
        }
      }

      if(card.type === 'normal'){//普通员工没有月消费限制
        return autoCallback();
      }

      if(card.type === 'staff'){//只有员工有折扣，专家按照原价
        actualAmount = publicLib.parseIntNumber(amount * supermarketDiscountForStaff);
        if(actualAmount === null || actualAmount < 0){
          return autoCallback({err: milkOrderError.amount_invalid});
        }
      }

      milkOrderLogic.getCurrentConsumptionAmount(card, function(err, currentConsumptionAmount){
        if(err){
          return autoCallback(err);
        }

        if(currentConsumptionAmount + amount > supermarketAmountLimit){
          return autoCallback({err: getError(milkOrderError.supermarket_consumption_amount_not_enough, (supermarketAmountLimit - currentConsumptionAmount)/100)});
        }

        if(actualAmount > card.amount * 100){
          return autoCallback({err: getError(milkOrderError.supermarket_consumption_card_amount_not_enough, card.amount)});
        }

        return autoCallback(null, currentConsumptionAmount);
      });
    },
    createMilkOrder: ['getCurrentConsumptionAmount', function(autoCallback){
      milkOrderLogic.createMilkOrder({
        description: req.body.description || '',
        amount: amount,
        actual_amount: actualAmount
      }, client, card, function(err, newOrder){
        return autoCallback(err, newOrder);
      });
    }],
    payByCard: ['createMilkOrder', function(autoCallback, results){
      cardLogic.payMilkOrder(client, card, results.createMilkOrder, actualAmount / 100, function(err, newCard){
        return autoCallback(err, newCard);
      });
    }],
    updateMilkOrderPaid: ['createMilkOrder', 'payByCard', function(autoCallback, results){
      var payTime = new Date();
      results.createMilkOrder._doc.paid = true;
      results.createMilkOrder._doc.pay_time = payTime;
      milkOrderLogic.updateMilkOrderPaid(results.createMilkOrder._id, payTime, function(err){
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
      milk_current_balance: (card.type === 'staff' || card.type === 'expert') ? supermarketAmountLimit - (results.getCurrentConsumptionAmount + amount) : -1,
      card_balance: results.payByCard.amount,
      order: results.createMilkOrder
    };
    return next();
  });
};

exports.getMilkOrdersByPagination = function(req, res, next){
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
  milkOrderLogic.getMilkOrdersByPagination(filter, req.pagination, function(err, result){
    if(err){
      return next(err);
    }

    req.data = {
      total_count: result.totalCount,
      limit: result.limit,
      milk_orders: result.milkOrders,
      statistics: result.statistics
    };
    return next();
  });
};
