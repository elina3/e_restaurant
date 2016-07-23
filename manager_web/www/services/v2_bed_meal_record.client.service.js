/**
 * Created by elinaguo on 16/7/16.
 */
'use strict';
angular.module('EWeb').factory('MealRecordService',
  ['Auth', 'RequestSupport', 'SystemError',
    function (Auth, RequestSupport, SystemError) {
      return {
        getMealRecords: function (params, callback) {
          RequestSupport.executeGet('/v2/bed_meal_records', params)
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
        getMealBills: function(params, callback){
          RequestSupport.executeGet('/v2/bed_meal_bills', params)
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
        exportMealBills: function(params, callback){
          RequestSupport.executeGet('/v2/bed_meal_bills/exports', params)
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
        getHospitalizedBills: function(params, callback){
          RequestSupport.executeGet('/v2/hospitalized_bills', params)
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
        checkoutHospitalizedBill: function(params, callback){
          RequestSupport.executePost('/v2/hospitalized_bills/pay', params)
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
        batchSave: function(params, callback){
          RequestSupport.executePost('/v2/bed_meal_records/batch_save', params)
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
        changeBed: function(params, callback){
          RequestSupport.executePost('/v2/change_bed', params)
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