/**
 * Created by elinaguo on 16/6/26.
 */
'use strict';
angular.module('EClientWeb').factory('HealthyMealService',
  ['RequestSupport', 'SystemError',
    function (RequestSupport, SystemError) {
      return {
        getBuildings: function (callback) {
          RequestSupport.executeGet('/bed/buildings/without_filter', {
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
        getFloorsByBuildingId: function(buildingId, callback){
          RequestSupport.executeGet('/bed/floors', {
            building_id: buildingId
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
        getHealthyNormalBedMealRecordByFloorToday: function(params, callback){
          RequestSupport.executeGet('/bed_meal_records/today_healthy_normal', params)
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
        createNewBill: function(params, callback){
          RequestSupport.executePost('/bed_meal_bills/single', params)
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
