/**
 * Created by elinaguo on 16/4/8.
 */
'use strict';
angular.module('EClientWeb').factory('LogService',
  ['RequestSupport', 'SystemError',
    function (RequestSupport, SystemError) {
      return {
        getLogs: function (param, callback) {
          RequestSupport.executeGet('/log', {
            current_page: param.currentPage,
            limit: param.limit,
            log_module: param.log_module,
            start_time_stamp: param.startTimeStamp,
            end_time_stamp: param.endTimeStamp
          })
            .then(function (data) {
              console.log(JSON.stringify(data));
              if (!callback) {
                return data;
              } else {
                if (data.err) {
                  return callback(data.err);
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
    }]);
