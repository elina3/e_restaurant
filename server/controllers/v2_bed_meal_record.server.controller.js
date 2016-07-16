/**
 * Created by elinaguo on 16/7/4.
 */
'use strict';
var async = require('async');
var publicLib = require('../libraries/public');

var bedMealRecordLogic = require('../logics/v2_bed_meal_record'),
  hospitalizedInfoLogic = require('../logics/hospitalized_info'),
  mealTypeLogic = require('../logics/v2_meal_type');

var bedMealRecordError = require('../errors/v2_bed_meal_record');

//营养餐设置页面保存
exports.batchSaveBedMealRecords = function (req, res, next) {
  var bedMealRecordInfos = req.body.bed_meal_record_infos || [];
  if (!Array.isArray(bedMealRecordInfos)) {
    return next({err: bedMealRecordError.invalid_bed_meall_infos});
  }

  var dateTimeStamp = req.body.meal_set_time_stamp;
  var time = new Date();
  if (dateTimeStamp) {
    time = new Date(parseInt(dateTimeStamp));
  }
  var mealSetDate = publicLib.parseToDate(time);

  var hospitalizedInfoIds = req.body.hospitalized_info_ids || [];
  if (hospitalizedInfoIds && !Array.isArray(hospitalizedInfoIds)) {
    hospitalizedInfoIds = [hospitalizedInfoIds];
  }

  if (hospitalizedInfoIds.length === 0 || bedMealRecordInfos.length === 0) {
    req.data = {
      success_count: 0,
      new_count: 0,
      exist_count: 0
    };
    return next();
  }

  async.auto({
    getHospitalizedInfoDic: function (autoCallback) {
      hospitalizedInfoLogic.getHospitalizedInfoByIds(hospitalizedInfoIds, function (err, hospitalizedInfos) {
        if (err) {
          return autoCallback(err);
        }

        var hospitalizedInfoDic = {};
        hospitalizedInfos.forEach(function (item) {
          hospitalizedInfoDic[item._id.toString()] = item;
        });

        return autoCallback(null, hospitalizedInfoDic);
      });
    },
    getMealTypeDic: function (autoCallback) {
      mealTypeLogic.queryMealTypes({}, function (err, mealTypes) {
        if (err) {
          return next(err);
        }

        var mealTypeDic = {};
        mealTypes.forEach(function (item) {
          mealTypeDic[item._id.toString()] = item;
        });

        return autoCallback(null, mealTypeDic);
      });
    },
    batchSaveBedMealRecord: ['getHospitalizedInfoDic', 'getMealTypeDic', function (autoCallback, results) {
      bedMealRecordLogic.batchSaveBedMealRecord(req.user,
        results.getHospitalizedInfoDic,
        results.getMealTypeDic,
        req.building, req.floor,
        mealSetDate,
        bedMealRecordInfos,
         function (err, result) {
          if (err) {
            return autoCallback(err);
          }
          return autoCallback(null, result);
        });
    }]
  }, function (err, results) {
    if (err) {
      return next(err);
    }

    req.data = {
      success_count: results.batchSaveBedMealRecord.successCount,
      new_count: results.batchSaveBedMealRecord.newCount,
      exist_count: results.batchSaveBedMealRecord.existCount
    };
    return next();
  });
};

//营养餐设置页面搜索结果
exports.getBedMealRecords = function (req, res, next) {
  var dateTimeStamp = req.query.meal_set_time_stamp;
  var time = new Date();
  if (dateTimeStamp) {
    time = new Date(parseInt(dateTimeStamp));
  }
  var mealSetDate = publicLib.parseToDate(time);
  bedMealRecordLogic.getMealBedRecordsByMealDate(req.building, req.floor, mealSetDate, function (err, mealBedRecords) {
    if (err) {
      return next(err);
    }

    req.data = {
      bed_meal_records: mealBedRecords
    };
    return next();
  });
};

//分页获取记录
exports.getBedMealRecordsByPagination = function(req, res, next){
  var timeRange = JSON.parse(req.query.time_range) || {};
  var defaultStart = new Date('1970-1-1 00:00:00');
  var startTime = !timeRange.startTime ? defaultStart : (new Date(timeRange.startTime) || defaultStart);
  var endTime = !timeRange.endTime ? new Date() : (new Date(timeRange.endTime) || new Date());

  bedMealRecordLogic.getMealBillByFilter({
    status: req.query.status || '',
    mealTag: req.query.meal_tag || '',
    mealTypeId: req.query.meal_type_id || '',
    idNumber: req.query.id_number || '',
    startTime: publicLib.parseToDate(startTime),
    endTime: publicLib.parseToDate(endTime)
  }, req.pagination, function(err, result){
    if(err){
      return next(err);
    }

    req.data = {
      total_amount: result.totalAmount,
      total_count: result.totalCount,
      limit: result.limit,
      bed_meal_bills: result.bedMealRecords
    };
    return next();
  });
};

//客户端选餐之前获取选餐设置记录（用于生成筛选条件）
exports.getNeedChooseBedMealRecords = function (req, res, next) {
  var dateTimeStamp = req.body.meal_set_time_stamp;
  var time = new Date();
  if (dateTimeStamp) {
    time = new Date(parseInt(dateTimeStamp));
  }
  var mealSetDate = publicLib.parseToDate(time);
  bedMealRecordLogic.needChoosePackageMealTypes(req.building, req.query.meal_tag, mealSetDate, function (err, bedMealRecords) {
    if (err) {
      return next(err);
    }

    req.data = {
      bed_meal_records: bedMealRecords
    };
    return next();
  });
};

//客户端选餐保存
exports.saveBedMealRecord = function(req, res, next){
  if(req.bed_meal_record.is_checkout){
    return next({err: bedMealRecordError.bed_meal_record_checkout});
  }

  if(req.hospitalized_info.is_leave_hospital){
    return next({err: bedMealRecordError.leave_hospital});
  }

  var packageMeals = req.body.package_meals || [];
  if(!Array.isArray(packageMeals)){
    return next({err: bedMealRecordError.invalid_package_meals});
  }

  if(packageMeals.length !== req.mealType.package_meals.length){
    return next({err: bedMealRecordError.wrong_package_meal_count});
  }

  var selectedPackageMeals = [];
  packageMeals.forEach(function(item){
    if(item.selected){
      selectedPackageMeals.push(item);
    }
  });

  var invalidPackageMeals = selectedPackageMeals.filter(function(item){
      return item.count <= 0;
  });

  if(invalidPackageMeals.length > 0){
    return next({err: bedMealRecordError.invalid_package_meal_count});
  }

  if(selectedPackageMeals.length === 0){
    return next({err: bedMealRecordError.no_package_meals});
  }

  bedMealRecordLogic.saveBedMealRecord(req.bed_meal_record, req.mealType, selectedPackageMeals, function(err, newBedMealRecord){
    if(err){
      return next(err);
    }

    req.data = {
      bed_meal_record: newBedMealRecord
    };
    return next();
  });
};

//换到新的床位
exports.changeToNewBed = function(req, res, next){
  if(req.dist_hospitalized_info){
    return next({err: bedMealRecordError.the_bed_has_been_hospitalized});
  }

  var dateTimeStamp = req.body.meal_set_time_stamp;
  var time = new Date();
  if (dateTimeStamp) {
    time = new Date(parseInt(dateTimeStamp));
  }
  var mealSetDate = publicLib.parseToDate(time);

  async.auto({
    newHospitalizedInfo: function(autoCallback){
      hospitalizedInfoLogic.changeToNewBed(req.hospitalized_info, req.bed, function(err, newHospitalizedInfo){
        if(err){
          return autoCallback(err);
        }

        return autoCallback(null, newHospitalizedInfo);
      });
    },
    generateNewBedMealRecords: ['newHospitalizedInfo', function(autoCallback, results){
      bedMealRecordLogic.generateNewRecordsByOneBedMealRecord(mealSetDate, req.hospitalized_info._id, req.building, req.floor, req.bed, results.newHospitalizedInfo, function(err, newBedMealRecord){
        if(err){
          return autoCallback(err);
        }

        return autoCallback(null, newBedMealRecord);
      });
    }]
  }, function(err, results){
    if(err){
      return next(err);
    }

    req.data = {
      new_bed_meal_records: results.generateNewBedMealRecords
    };
    return next();
  });
};

//交换床位
exports.swapBed = function(req, res, next){
  if(!req.dist_hospitalized_info){
    return next({err: bedMealRecordError.the_bed_has_no_sicker});
  }
  var dateTimeStamp = req.body.meal_set_time_stamp;
  var time = new Date();
  if (dateTimeStamp) {
    time = new Date(parseInt(dateTimeStamp));
  }
  var mealSetDate = publicLib.parseToDate(time);

  async.auto({
    swapBedMealRecords: ['newHospitalizedInfo', function(autoCallback, results){
      bedMealRecordLogic.swapBedMealRecordsByOneBedMealRecord(
        mealSetDate,
        req.hospitalized_info,
        req.dist_hospitalized_info, function(err){
        if(err){
          return autoCallback(err);
        }

        return autoCallback();
      });
    }],
    swapHospitalizedBed: ['swapBedMealRecords', function(autoCallback){
      hospitalizedInfoLogic.swapBed(req.hospitalized_info, req.dist_hospitalized_info, function(err, result){
        if(err){
          return autoCallback(err);
        }

        return autoCallback(null, result);
      });
    }],
  }, function(err, results){
    if(err){
      return next(err);
    }

    req.data = {
      success: true
    };
    return next();
  });
};

