/**
 * Created by elinaguo on 16/6/14.
 */
'use strict';
var async = require('async');
var systemError = require('../errors/system'),
  bedMealRecordError = require('../errors/bed_meal_record');
var bedMealRecordLogic = require('../logics/bed_meal_record'),
  hospitalizedInfoLogic = require('../logics/hospitalized_info'),
  bedMealBillLogic = require('../logics/bed_meal_bill');


function saveOneBedMealRecord(user, time, building, floor, bedId, bedMealInfo, callback) {
  hospitalizedInfoLogic.getHospitalizedInfoByBed(building._id, floor._id, bedId, function (err, hospitalizedInfo) {
    if (err) {
      return callback(err);
    }

    if (!hospitalizedInfo) {
      return callback({err: bedMealRecordError.no_sicker_in_bed});
    }

    bedMealRecordLogic.createAndGetBedMealRecord(user, time, hospitalizedInfo, building, floor, bedId, function (err, bedMealRecord) {
      if (err) {
        return callback(err);
      }

      bedMealBillLogic.getMealBillByRecordId(bedMealRecord._id, function (err, bedMealBills) {
        if (err) {
          return callback(err);
        }

        if (bedMealBills && bedMealBills.length > 0) {
          bedMealBills.forEach(function(item){//如果账单已清算，则不更新，使用旧的饮食类型；或者是普食已选餐也不更新，使用旧饮食类型
            if(item.is_checkout || (item.meal_type === 'healthy_normal' && item.goods_bills.length > 0)){
              bedMealInfo[item.meal_tag] = item.meal_type;
            }
          });
        }

        bedMealRecordLogic.updateBedMealRecordSetting(time, bedMealRecord, bedMealInfo.breakfast, bedMealInfo.lunch, bedMealInfo.dinner
          , function (err, bedMealRecord) {
            if (err) {
              return callback(err);
            }

            return callback(null, bedMealRecord);
          });
      });
    });
  });
}

exports.saveBedMealRecords = function (req, res, next) {
  var dateTimeStamp = req.body.meal_set_time_stamp;
  var bedMealInfos = req.body.bed_meal_infos || [];
  var time = new Date();
  if (dateTimeStamp) {
    time = new Date(parseInt(dateTimeStamp));
  }

  if (!Array.isArray(bedMealInfos)) {
    return next({err: bedMealRecordError.invalid_bed_meall_infos});
  }

  var bedMealRecords = [];
  async.each(bedMealInfos, function (bedMealInfo, eachCallback) {
    saveOneBedMealRecord(req.user, time, req.building, req.floor, bedMealInfo._id, bedMealInfo, function(err, bedMealRecord){
      if (err) {
        return eachCallback(err);
      }

      bedMealRecords.push(bedMealRecord);
      return eachCallback();
    });
  }, function (err) {
    if (err) {
      return next(err);
    }

    req.data = {
      bed_meal_records: bedMealRecords
    };
    return next();
  });
};

exports.getBedMealRecords = function (req, res, next) {
  var timeStamp = req.query.time_stamp || '';
  var bedId = req.query.bed_id || '';
  var time = new Date();
  if (timeStamp) {
    time = new Date(parseInt(timeStamp))
  }

  bedMealRecordLogic.getBedMealRecord(time, req.building._id, req.floor._id, bedId, function (err, bedMealRecords) {
    if (err) {
      return next(err);
    }

    req.data = {
      bed_meal_records: bedMealRecords
    };
    return next();
  });
};

exports.getHealthyNormalBedMealRecordByFloorToday = function(req, res, next){
  var mealTag = req.query.meal_tag;//breakfast, lunch, dinner
  bedMealRecordLogic.getHealthyNormalMealRecordByBedGroup(req.building, req.floor, mealTag, function(err, bedMealRecords){
    if (err) {
      return next(err);
    }


    var records = bedMealRecords.map(function(item){
      return {
        bed: item.bed,
        hospitalized_info: item.hospitalized_info,
        meal_set_date: item.meal_set_date,
        create_user: item.create_user,
        _id: item._id
      };
    });

    req.data = {
      bed_meal_records: records
    };
    return next();
  });
};