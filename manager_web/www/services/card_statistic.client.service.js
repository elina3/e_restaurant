/**
 * Created by elinaguo on 16/5/15.
 */

'use strict';
angular.module('EWeb').factory('CardStatisticService',
  ['Auth', 'RequestSupport', 'SystemError',
    function (Auth, RequestSupport, SystemError) {
      return {
        getAmountAndCountStatistics: function(timeRangeString, callback){
          RequestSupport.executeGet('/card/amount_count_statistics', {
            time_range: timeRangeString
          })
            .then(function (data) {
              if (!callback) {
                return data;
              }

              if (data.err) {
                return callback(data.zh_message || data.err);
              }

              callback(null, data);
            },
            function (err) {
              return callback(SystemError.network_error);
            });
        }
      };
    }]);