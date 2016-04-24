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
    }
  };
}]);
