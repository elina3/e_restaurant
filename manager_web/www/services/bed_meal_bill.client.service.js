/**
 * Created by elinaguo on 16/6/26.
 */
'use strict';
angular.module('EWeb').factory('BedMealBillService',
  ['Auth', 'RequestSupport', 'SystemError',
    function (Auth, RequestSupport, SystemError) {
      return {
        //账单查询
        queryBedMealBillsByFilter: function (params, callback) {
          RequestSupport.executeGet('/bed_meal_bills', {
            time_range: params.timeRangeString,
            id_number: params.idNumber,
            meal_tag: params.mealTag,
            meal_type: params.mealType,
            status: params.status,
            current_page: params.currentPage,
            limit: params.limit,
            skip_count: params.skipCount
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
        //登记人员获取单个病人的账单
        querySickerBedMealBillsByFilter: function (params, callback) {
          RequestSupport.executeGet('/hospitalized_info/bed_meal_bills', {
            hospitalized_info_id: params.hospitalizedInfoId,
            status: params.status,
            current_page: params.currentPage,
            limit: params.limit,
            skip_count: params.skipCount
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
        batchCreateBills: function (params, callback) {
          RequestSupport.executePost('/bed_meal_bills/batch', {
            building_id: params.buildingId,
            floor_id: params.floorId,
            bed_meal_record_ids: params.bedMealRecordIds
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
        translateMealType: function (bill) {
          var result = '';
          switch (bill.meal_type) {
            case 'liquid_diets':
              result = '流质';
              break;
            case 'semi_liquid_diets':
              result = '半流质';
              break;
            case 'diabetic_diets':
              result = '糖尿病饮食';
              break;
            case 'low_fat_low_salt_diets':
              result = '半糖半盐';
              break;
            case 'healthy_normal':
              result = '普食(';
              var names = bill.goods_bills.map(function (item) {
                return item.name;
              });

              result += names.join(',');
              result += ')';
              break;
          }

          return result;
        },
        translateMealTag: function (mealTag) {

          switch (mealTag) {
            case 'breakfast':
              return '早餐';
            case 'lunch':
              return '午餐';
            case 'dinner':
              return '晚餐';
          }

          return '';
        }
      };
    }]);