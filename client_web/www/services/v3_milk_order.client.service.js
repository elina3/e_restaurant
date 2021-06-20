'use strict';
angular.module('EClientWeb').factory('MilkOrderService',
  ['RequestSupport', 'SystemError',
    function (RequestSupport, SystemError) {
      return {
        createMilkOrder: function (params, callback) {
          RequestSupport.executePost('/client/milk_order/create_and_pay', params)
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
        rePay: function (params, callback) {
          RequestSupport.executeGet('/client/milk_order/re_pay', params)
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
        }
      };
    }
  ]);
