/**
 * Created by elinaguo on 16/4/24.
 */

'use strict';
angular.module('EWeb').factory('CardHistoryService',
  ['Auth', 'RequestSupport', 'SystemError',
    function (Auth, RequestSupport, SystemError) {
      return {
        getCardHistories: function(param,filter, timeRangeString, callback){
          RequestSupport.executeGet('/cards_history_list', {
            current_page: param.currentPage,
            limit: param.limit,
            skip_count: param.skipCount,
            start_time_stamp: filter.startTimeStamp,
            end_time_stamp: filter.endTimeStamp,
            keyword: filter.keyword,
            action: filter.action,
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
        },
        deleteCardPay: function(cardHistoryId, callback){
          RequestSupport.executePost('/card/delete_pay', {
            card_history_id: cardHistoryId
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
        }
      };
    }]);

