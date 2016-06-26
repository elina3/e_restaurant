/**
 * Created by elinaguo on 16/6/26.
 */
'use strict';
angular.module('EWeb').factory('HospitalizedInfoService',
  ['Auth', 'RequestSupport', 'SystemError',
    function (Auth, RequestSupport, SystemError) {
      return {
        createNewHospitalizedInfo: function (params, callback) {
          RequestSupport.executePost('/hospitalized_info', {
            building_id: params.buildingId,
            floor_id: params.floorId,
            bed_id: params.bedId,
            sicker_info: params.sickerInfo
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
        searchHospitalizedInfoByIdNumber: function (params, callback) {
          RequestSupport.executeGet('/hospitalized_info', {
            id_number: params.idNumber,
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
        searchHospitalizedInfoByFilter: function (params, callback) {
          RequestSupport.executeGet('/hospitalized_info/filter', params)
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
        leaveHospital: function (params, callback) {
          RequestSupport.executePost('/hospitalized_info/leaveHospital', {
            hospitalized_info_id: params.hospitalizedInfoId
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

      };
    }]);