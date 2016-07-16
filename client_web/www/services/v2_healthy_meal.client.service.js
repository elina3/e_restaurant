/**
 * Created by elinaguo on 16/7/16.
 */
'use strict';
angular.module('EClientWeb').factory('MealRecordService',
  ['Auth', 'RequestSupport', 'SystemError',
    function (Auth, RequestSupport, SystemError) {
      return {
        getMealSettingFilter: function (params, callback) {
          RequestSupport.executeGet('/v2/client/bed_meal_records', params)
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
        saveMealSetting: function(params, callback){
          RequestSupport.executePost('/v2/client/bed_meal_record/save', params)
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