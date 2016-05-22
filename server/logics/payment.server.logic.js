/**
 * Created by elinaguo on 16/4/17.
 */
'use strict';
var async = require('async');
var mongooseLib = require('../libraries/mongoose');
var appDb = mongooseLib.appDb;
var Payment = appDb.model('Payment');
var cardLogic = require('../logics/card');

var systemError = require('../errors/system');
var paymentError = require('../errors/payment');

function getTotalAmountThisMonth(idNumber, callback) {
  var thisMonth = new Date((new Date()).Format('yyyy-MM-01'));

  var query = {
    card_id_number: idNumber,
    deleted_status: false,
    pay_time: {$gte: thisMonth},
    paid: true
  };
  Payment.aggregate([
    {$match: query},
    {
      $group: {
        _id: '$card_id_number',
        totalAmount: {$sum: '$total_amount'},
        amount: {$sum: '$amount'}
      }
    }
  ], function (err, results) {
    if (err || !results) {
      return callback({err: systemError.database_query_error});
    }

    if (results.length === 0) {
      return callback(null, {
        _id: idNumber,
        totalAmount: 0,//应收
        amount: 0//实收
      });
    }

    results[0].totalAmount = parseFloat(results[0].totalAmount.toFixed(3));
    results[0].amount = parseFloat(results[0].amount.toFixed(3));

    return callback(null, results[0]);
  });
}


exports.pay = function (client, order, method, card, amount, callback) {

  async.auto({
    generatePayment: function (autoCallback) {
      Payment.findOne({order: order._id, client: client._id})
        .populate('order')
        .exec(function (err, payment) {
          if (err) {
            return autoCallback({err: systemError.database_query_error});
          }

          if (!payment) {
            payment = new Payment({
              client: client._id,
              order: order._id
            });
          }

          if (payment.paid) {
            return autoCallback({err: paymentError.order_paid});
          }

          if(payment.deleted_status){
            return autoCallback({err: paymentError.order_deleted});
          }

          if (method !== 'card') {
            return autoCallback({err: paymentError.not_support_method});
          }

          payment.card = card._id;
          payment.card_id_number = card.id_number;
          payment.card_number = card.card_number;
          payment.method = method;
          payment.total_amount = parseFloat(amount);//应付金额
          payment.save(function (err, payment) {
            if (err || !payment) {
              return autoCallback({err: systemError.database_save_error});
            }

            return autoCallback(null, payment);
          });
        });
    },
    consumeAmountThisMonth: function (autoCallback) {
      if (card.type === 'normal') {
        return autoCallback(null, {});
      }

      getTotalAmountThisMonth(card.id_number, function (err, paymentStatisticResult) {
        if (err) {
          return autoCallback(err);
        }

        return autoCallback(null, paymentStatisticResult);
      });
    }
  }, function (err, results) {
    if(err){
      return callback(err);
    }
    cardLogic.pay(client, card, results.generatePayment.total_amount, results.consumeAmountThisMonth, function (err, payResult) {
      if (err || !payResult) {
        return callback(err);
      }
      var payTime = new Date();
      var hasDiscount = payResult.actualAmount !==results.generatePayment.total_amount;
      results.generatePayment.paid = true;
      results.generatePayment.pay_time = payTime;
      results.generatePayment.amount = payResult.actualAmount;//实付金额
      results.generatePayment.has_discount = hasDiscount;
      results.generatePayment.save(function (err, newPayment) {
        if (err || !newPayment) {
          return callback({err: paymentError.update_order_to_paid_error});
        }

        order.status = 'paid';
        order.actual_amount = payResult.actualAmount;
        order.paid = true;
        order.pay_time = payTime;
        order.has_discount = hasDiscount;
        order.card_id_number = payResult.card.id_number;
        order.card_number = payResult.card.card_number;
        order.save(function (err, newOrder) {
          if (err || !newOrder) {
            return callback({err: systemError.database_save_error});
          }

          return callback(null, {
            payment: newPayment,
            cardInfo: payResult.card
          });
        });
      });
    });
  });
};

exports.getPayments = function(filter, pagination, callback){
  var query = {
    deleted_status: false
  };

  if(filter.startTime && filter.endTime){
    query.$and = [{create_time: {$gte: filter.startTime}},{create_time:{$lte: filter.endTime}}];
  }

  if(filter.keyword){
    query.$or = [{card_number: filter.keyword},{card_id_number:filter.keyword}]
  }

  Payment.count(query)
    .exec(function(err, totalCount){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      if (pagination.limit === -1) {
        pagination.limit = totalCount;
      }

      if (pagination.skipCount === -1) {
        pagination.skipCount = pagination.limit * (pagination.currentPage - 1);
      }

      Payment.find(query)
        .sort({create_time: -1})
        .skip(pagination.skipCount)
        .limit(pagination.limit)
        .exec(function(err, payments){
          if(err){
            return callback({err: systemError.database_query_error});
          }

          return callback(null, {
            totalCount: totalCount,
            limit: limit,
            payments: payments
          });
        });

    });
};


exports.getTodayAmount = function (callback) {
  var query = {paid: true, deleted_status: false};
  Payment.aggregate([
    {$match: query},
    {
      $group: {
        _id: '$object',
        totalAmount: {$sum: '$amount'}
      }
    }
  ], function (err, results) {
    if (err) {
      return callback({err: systemError.database_query_error});
    }

    var totalAmount = results[0] ? results[0].totalAmount : 0;
    var startTime = new Date(new Date().toLocaleDateString());
    query.update_time = {$gte: startTime};
    Payment.aggregate([
      {$match: query},
      {
        $group: {
          _id: '$object',
          totalAmount: {$sum: '$amount'}
        }
      }
    ], function (err, results) {
      if (err) {
        return callback({err: systemError.database_query_error});
      }

      var todayAmount = results[0] ? results[0].totalAmount : 0;

      return callback(err, {
        total_amount: parseFloat(totalAmount.toFixed(3)),
        today_amount: parseFloat(todayAmount.toFixed(3))

      });
    });
  });
};