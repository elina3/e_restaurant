/**
 * Created by elinaguo on 16/6/14.
 */
'use strict';
angular.module('EWeb').factory('BedMealRecordService',
  ['Auth', 'RequestSupport', 'SystemError',
    function (Auth, RequestSupport, SystemError) {
      return {
        getBedMealRecords: function (params, callback) {
          RequestSupport.executeGet('/bed_meal_records', {
            meal_set_time_stamp: params.timeStamp,
            building_id: params.buildingId,
            floor_id: params.floorId,
            bed_id: params.bedId
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
        saveBedMealRecords: function(params, callback){
          RequestSupport.executePost('/bed_meal_records', {
            meal_set_time_stamp: params.timeStamp,
            building_id: params.buildingId,
            floor_id: params.floorId,
            bed_meal_infos: params.bedMealInfos
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