/**
* Created by elinaguo on 16/4/20.
*/
'use strict';
angular.module('EClientWeb').factory('OrderService',
  ['RequestSupport', 'SystemError',
    function (RequestSupport, SystemError) {
      return {
        getOrderDetail: function (orderId, callback) {
          RequestSupport.executeGet('/client/order', {
            order_id: orderId
          })
            .then(function (data) {
              if (!callback) {
                return data;
              } else {
                if (data.err) {
                  return callback(data.err);
                }
                callback(null, data);
              }
            },
            function (err) {
              if (!callback) {
                return SystemError.network_error;
              }
              callback(SystemError.network_error);
            });
        },
        createOrder: function (orderInfo, callback) {
          RequestSupport.executePost('/client/order', {
            order_info: orderInfo
          })
            .then(function (data) {
              if (!callback) {
                return data;
              } else {
                if (data.err) {
                  return callback(data.err);
                }
                callback(null, data);
              }
            },
            function (err) {
              if (!callback) {
                return SystemError.network_error;
              }
              callback(SystemError.network_error);
            });
        },
        pay: function(orderId, cardNumber, amount, callback){
          RequestSupport.executePost('/client/order/pay', {
            order_id: orderId,
            card_number: cardNumber,
            amount: amount
          })
            .then(function (data) {
              if (!callback) {
                return data;
              } else {
                if (data.err) {
                  return callback(data.err);
                }
                callback(null, data);
              }
            },
            function (err) {
              if (!callback) {
                return SystemError.network_error;
              }
              callback(SystemError.network_error);
            });
        }

      };
    }]);
