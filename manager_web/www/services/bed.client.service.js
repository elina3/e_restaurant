/**
 * Created by elinaguo on 16/6/12.
 */

'use strict';
angular.module('EWeb').factory('BedService',
  ['Auth', 'RequestSupport', 'SystemError',
    function (Auth, RequestSupport, SystemError) {
      return {
        getBuildings: function (callback) {
          RequestSupport.executeGet('/bed/buildings', {
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
        getBedsByFloorId: function(floorId, callback){
          RequestSupport.executeGet('/bed/list', {
            floor_id: floorId
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