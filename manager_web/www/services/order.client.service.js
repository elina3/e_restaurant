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
    getOrders: function(param, filter, timeRangeString, callback){
      RequestSupport.executeGet('/user/order_list', {
        current_page: param.currentPage,
        limit: param.limit,
        skip_count: param.skipCount,
        status: filter.status,
        card_number: filter.card_number,
        card_id_number: filter.card_id_number,
        has_discount: filter.has_discount,
        client_username: filter.client_username,
        time_range: timeRangeString
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
    recoverOrder: function(orderId, method, callback){
      RequestSupport.executePost('/user/recover_order', {
        order_id: orderId,
        method: method
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
    getOrderStatisticByTimeTagGroup: function(timeRangeString, callback){
      RequestSupport.executeGet('/user/order/time_tag_statistic', {
        time_range: timeRangeString
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
    //获取用户饭卡消费情况:普通饭卡管理员只能看普通饭卡的订单消费情况，员工专家饭卡管理员能看员工饭卡和专家饭卡的订单消费情况
    getCardOrderStatisticByUserRole: function(timeRangeString, callback){
      RequestSupport.executeGet('/user/order/card_order_statistic', {
        time_range: timeRangeString
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
