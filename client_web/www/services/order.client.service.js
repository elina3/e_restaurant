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
                  return callback(data.zh_message || data.err);
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
                  return callback(data.zh_message || data.err);
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
            card_keyword: cardNumber,
            amount: amount
          })
            .then(function (data) {
              if (!callback) {
                return data;
              } else {
                if (data.err) {
                  return callback(data.zh_message || data.err);
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
        getMyOrders: function(pagination, callback){
          RequestSupport.executeGet('/client/my_orders', {
            skip_count: pagination.skipCount,
            limit: pagination.limit
          })
            .then(function (data) {
              if (!callback) {
                return data;
              } else {
                if (data.err) {
                  return callback(data.zh_message || data.err);
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
        card: function(cardNumber,callback){
          RequestSupport.executeGet('/client/card', {
            card_keyword: cardNumber,
          })
            .then(function (data) {
              if (!callback) {
                return data;
              } else {
                if (data.err) {
                  return callback(data.zh_message || data.err);
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
        translateOrderStatus: function(status){
          switch(status){
            case 'unpaid':
              return '未支付';
            case 'paid':
              return '已支付';
            case 'cooking':
              return '烹饪中';
            case 'transporting':
              return '运送中';
            case 'complete':
              return '已完成';
          }
        },
        translateGoodsStatus: function(status){
          switch(status){
            case 'prepare':
              return '准备中';
            case 'cooking':
              return '烹饪中';
            case 'complete':
              return '已完成';
          }
        }
      };
    }]);
