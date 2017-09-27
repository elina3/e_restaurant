'use strict';
var async = require('async');

var supermarketOrderLogic = require('../logics/supermarket_order'),
  clientLogic = require('../logics/client'),
  cardLogic = require('../logics/card');

var publicLib = require('../libraries/public'),
  supermarketOrderError = require('../errors/v3_supermaket_order');


var supermarketAmountLimit = 100 * 100, //默认100元（单位：分）
  supermarketDiscountForStaff = 0.25;

function getError(err, value){
  var newError = JSON.parse(JSON.stringify(err));
  newError.zh_message = newError.zh_message.replace('{{value1}}', value);
  newError.message = newError.zh_message.replace('{{value1}}', value);
  return newError;
}

exports.generateOrder = function(req, res, next){
  var client = req.client;
  var card = req.card;
  var amount = publicLib.parseIntNumber(req.body.amount);//单位：分
  if(amount === null || amount <= 0){
    return next({err: supermarketOrderError.amount_invalid});
  }

  var actualAmount = amount;
  async.auto({
    getCurrentConsumptionAmount: function(autoCallback){
      if(card.type !== 'staff'){
        if(card.amount * 100 < amount){
          return autoCallback({err: getError(supermarketOrderError.card_amount_not_enough, card.amount)});
        }
        return autoCallback();
      }

      actualAmount = publicLib.parseIntNumber(amount * supermarketDiscountForStaff);
      if(actualAmount === null || actualAmount < 0){
        return autoCallback({err: supermarketOrderError.amount_invalid});
      }

      supermarketOrderLogic.getCurrentConsumptionAmount(card, function(err, currentConsumptionAmount){
        if(err){
          return autoCallback(err);
        }

        if(currentConsumptionAmount + amount > supermarketAmountLimit){
          return autoCallback({err: getError(supermarketOrderError.supermarket_consumption_amount_not_enough, (supermarketAmountLimit - currentConsumptionAmount)/100)});
        }

        if(actualAmount > card.amount * 100){
          return autoCallback({err: getError(supermarketOrderError.supermarket_consumption_card_amount_not_enough, card.amount)});
        }

        return autoCallback(null, currentConsumptionAmount);
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
      supermarket_current_balance: card.type === 'staff' ? supermarketAmountLimit - (results.getCurrentConsumptionAmount + amount) : -1,
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
