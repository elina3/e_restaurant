/**
 * Created by elinaguo on 16/4/24.
 */

'use strict';
angular.module('EWeb').factory('OrderService', ['RequestSupport', 'SystemError', function (RequestSupport, SystemError) {
  return {
    loadTodayAmount: function (callback) {
      RequestSupport.executeGet('/user/order/today_amount', {})
        .then(function (data) {
          if (!callback) {
            return data;
          }
          else {
            if (data.err) {
              return callback(data.zh_message || data.err);
            }

            callback(null, data);
          }
        },
        function (err) {
          return callback(SystemError.network_error);
        });
    },
    getOrders: function(param, filter, callback){
      RequestSupport.executeGet('/user/order_list', {
        current_page: param.currentPage,
        limit: param.limit,
        skip_count: param.skipCount,
        status: filter.status,
        card_number: filter.card_number,
        card_id_number: filter.card_id_number,
        has_discount: filter.has_discount,
        client_username: filter.client_username,
        start_time_stamp: filter.start_time_stamp,
        end_time_stamp: filter.end_time_stamp
      })
        .then(function (data) {
          if (!callback) {
            return data;
          }
          else {
            if (data.err) {
              return callback(data.zh_message || data.err);
            }

            callback(null, data);
          }
        },
        function (err) {
          return callback(SystemError.network_error);
        });
    },
    cookOrder: function(orderId, callback){
      RequestSupport.executePost('/user/order/cook', {
        order_id: orderId
      })
        .then(function (data) {
          if (!callback) {
            return data;
          }
          else {
            if (data.err) {
              return callback(data.zh_message || data.err);
            }

            callback(null, data);
          }
        },
        function (err) {
          return callback(SystemError.network_error);
        });
    },
    deliveryOrder: function(orderId, callback){
      RequestSupport.executePost('/user/order/transport', {
        order_id: orderId
      })
        .then(function (data) {
          if (!callback) {
            return data;
          }
          else {
            if (data.err) {
              return callback(data.zh_message || data.err);
            }

            callback(null, data);
          }
        },
        function (err) {
          return callback(SystemError.network_error);
        });
    },
    completeOrder: function(orderId, callback){
      RequestSupport.executePost('/user/order/complete', {
        order_id: orderId
      })
        .then(function (data) {
          if (!callback) {
            return data;
          }
          else {
            if (data.err) {
              return callback(data.zh_message || data.err);
            }

            callback(null, data);
          }
        },
        function (err) {
          return callback(SystemError.network_error);
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
    translateGoodsOrderStatus: function(status){
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
