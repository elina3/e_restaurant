/**
 * Created by elinaguo on 16/4/24.
 */

'use strict';
angular.module('EWeb').factory('CardHistoryService',
  ['Auth', 'RequestSupport', 'SystemError',
    function (Auth, RequestSupport, SystemError) {
      return {
        getCardHistories: function(param,keyword, callback){
          RequestSupport.executeGet('/cards_history_list', {
            current_page: param.currentPage,
            limit: param.limit,
            skip_count: param.skipCount,
            keyword: keyword
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

