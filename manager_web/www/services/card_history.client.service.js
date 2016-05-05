/**
 * Created by elinaguo on 16/4/24.
 */

'use strict';
angular.module('EWeb').factory('CardHistoryService',
  ['Auth', 'RequestSupport', 'SystemError',
    function (Auth, RequestSupport, SystemError) {
      return {
        getCardHistories: function(param,filter, callback){
          RequestSupport.executeGet('/cards_history_list', {
            current_page: param.currentPage,
            limit: param.limit,
            skip_count: param.skipCount,
            start_time_stamp: filter.startTimeStamp,
            end_time_stamp: filter.endTimeStamp,
            keyword: filter.keyword
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

