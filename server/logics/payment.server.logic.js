/**
 * Created by elinaguo on 16/4/17.
 */
'use strict';
var mongooseLib = require('../libraries/mongoose');
var appDb = mongooseLib.appDb;
var Payment = appDb.model('Payment');
var cardLogic = require('../logics/card');

var systemError = require('../errors/system');
var paymentError = require('../errors/payment');

exports.pay = function(client, order, method, card, amount, callback){
  Payment.findOne({order: order._id, client: client._id})
    .populate('order')
    .exec(function(err, payment){
    if(err){
      return callback({err: systemError.database_query_error});
    }

    if(!payment){
      payment = new Payment({
        client: client._id,
        order: order._id
      });
    }

    if(payment.paid){
      return callback({err: paymentError.order_paid});
    }

    if(method !== 'card'){
      return callback({err: paymentError.not_support_method});
    }

    payment.method = method;
    payment.amount = parseFloat(amount);
    payment.save(function(err, payment){
      if(err || !payment){
        return callback({err: systemError.database_save_error});
      }

      cardLogic.pay(card,  payment.amount, function(err, newCard){
        if(err || !newCard){
          return callback(err);
        }

        payment.paid = true;
        payment.save(function(err, payment){
          if(err || !payment){
            return callback({err: paymentError.update_order_to_paid_error});
          }

          order.paid = true;
          order.save(function(err, newOrder){
            if(err || !newOrder){
              return callback({err: systemError.database_save_error});
            }

            return callback(null, {
              payment: payment,
              cardInfo: newCard
            });
          });
        });
      });
    });
  });
};
