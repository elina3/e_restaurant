/**
 * Created by elinaguo on 16/7/10.
 */

'use strict';
angular.module('EWeb').factory('MealTypeService',
  ['Auth', 'RequestSupport', 'SystemError',
    function (Auth, RequestSupport, SystemError) {
      return {
        getMealTypes: function (callback) {
          RequestSupport.executeGet('/v2/meal_type/list', {
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
        addNewMealType: function(mealTypeInfo, callback){
          RequestSupport.executePost('/v2/meal_type/add', {
            meal_type_info: mealTypeInfo
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
        modifyMealType: function(mealTypeId, mealTypeInfo, callback){
          RequestSupport.executePost('/v2/meal_type/modify', {
            meal_type_id: mealTypeId,
            meal_type_info: mealTypeInfo
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
        deleteMealType: function(mealTypeId, callback){
          RequestSupport.executePost('/v2/meal_type/delete', {
            meal_type_id: mealTypeId
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