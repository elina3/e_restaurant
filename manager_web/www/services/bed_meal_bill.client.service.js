/**
 * Created by elinaguo on 16/6/26.
 */
'use strict';
angular.module('EWeb').factory('BedMealBillService',
  ['Auth', 'RequestSupport', 'SystemError',
    function (Auth, RequestSupport, SystemError) {
      return {
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
        //saveBedMealRecords: function(params, callback){
        //  RequestSupport.executePost('/bed_meal_records', {
        //    meal_set_time_stamp: params.timeStamp,
        //    building_id: params.buildingId,
        //    floor_id: params.floorId,
        //    bed_meal_infos: params.bedMealInfos
        //  })
        //    .then(function (data) {
        //      if (!callback) {
        //        return data;
        //      }
        //
        //      if (data.err) {
        //        return callback(data.zh_message || data.err);
        //      }
        //
        //      callback(null, data);
        //    },
        //    function (err) {
        //      return callback(SystemError.network_error);
        //    });
        //}
      };
    }]);