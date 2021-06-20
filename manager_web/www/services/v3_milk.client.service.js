'use strict';
angular.module('EWeb').factory('MilkOrderService', ['RequestSupport', 'SystemError', function (RequestSupport, SystemError) {
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
    getMilkOrders: function(param, filter, timeRangeString, callback){
      RequestSupport.executeGet('/user/milk_orders', {
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
