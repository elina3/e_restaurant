/**
 * Created by elinaguo on 16/7/4.
 */
'use strict';
var async = require('async');
var publicLib = require('../libraries/public');

var bedMealRecordLogic = require('../logics/v2_bed_meal_record'),
  hospitalizedInfoLogic = require('../logics/hospitalized_info'),
  mealTypeLogic = require('../logics/v2_meal_type'),
  bedLogic = require('../logics/bed');

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

exports.copyPreviousSetting = function (req, res, next) {
  var dateTimeStamp = req.body.meal_set_time_stamp;
  var time = new Date();
  if (dateTimeStamp) {
    time = new Date(parseInt(dateTimeStamp));
  }
  var mealSetDate = publicLib.parseToDate(time);
  async.auto({
    getBeds: function (autoCallback) {
      hospitalizedInfoLogic.getBedsWithSickInBuildingFloor(req.building._id, req.floor._id, function (err, beds) {
        return autoCallback(err, beds);
      });
    },
    getPreviousDinnerMealRecordings: ['getBeds', function (autoCallback, results) {
      if (!results.getBeds || results.getBeds.length === 0) {
        return autoCallback(null, []);
      }

      var previousDate = new Date(mealSetDate.getTime());//前一天
      previousDate.setDate(previousDate.getDate() - 1);

      bedMealRecordLogic.getMealBedRecordsByMealDateAndTag(req.building, req.floor, results.getBeds, previousDate, 'dinner', function (err, bedMealRecords) {
        return autoCallback(err, bedMealRecords);
      });
    }],
    copy: ['getPreviousDinnerMealRecordings', function (autoCallback, results) {
      if (!results.getPreviousDinnerMealRecordings || results.getPreviousDinnerMealRecordings.length === 0) {
        return autoCallback();
      }

      async.each(results.getPreviousDinnerMealRecordings, function (mealRecord, eachCallback) {
        if (!mealRecord.hospitalized_info || mealRecord.hospitalized_info.is_leave_hospital) {
          return eachCallback();
        }

        if (!mealRecord.meal_type_id || mealRecord.meal_type_id.deleted_status) {
          return eachCallback();
        }

        bedMealRecordLogic.copyCreateByPreviousDinnerMealRecording(mealRecord, mealSetDate, function (err) {
          return eachCallback(err);
        });
      }, function (err) {
        return autoCallback(err);
      });
    }]
  }, function (err, results) {
    if (err) {
      return next(err);
    }

    req.data = {
      success: true
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
exports.getBedMealRecordsByPagination = function (req, res, next) {
  var timeRange = JSON.parse(req.query.time_range) || {};
  var defaultStart = new Date('1970-1-1 00:00:00');
  var startTime = !timeRange.startTime ? defaultStart : (new Date(timeRange.startTime) || defaultStart);
  var endTime = !timeRange.endTime ? new Date() : (new Date(timeRange.endTime) || new Date());

  bedMealRecordLogic.getMealBillByFilter({
    buildingId: req.query.building_id || '',
    floorId: req.query.floor_id || '',
    mealTag: req.query.meal_tag || '',
    mealTypeId: req.query.meal_type_id || '',
    idNumber: req.query.id_number || '',
    startTime: publicLib.parseToDate(startTime),
    endTime: publicLib.parseToDate(endTime)
  }, req.pagination, function (err, result) {
    if (err) {
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

exports.getMealBills = function (req, res, next) {
  var timeRange = JSON.parse(req.query.time_range) || {};
  var defaultStart = new Date('1970-1-1 00:00:00');
  var startTime = !timeRange.startTime ? defaultStart : (new Date(timeRange.startTime) || defaultStart);
  var endTime = !timeRange.endTime ? new Date() : (new Date(timeRange.endTime) || new Date());

  bedMealRecordLogic.getMealBills({
    buildingId: req.query.building_id || '',
    floorId: req.query.floor_id || '',
    mealTag: req.query.meal_tag || '',
    mealTypeId: req.query.meal_type_id || '',
    idNumber: req.query.id_number || '',
    startTime: publicLib.parseToDate(startTime),
    endTime: publicLib.parseToDate(endTime)
  }, function (err, bedMealRecords) {
    if (err) {
      return next(err);
    }

    req.data = {
      bed_meal_bills: bedMealRecords
    };
    return next();
  });
};

//获取病人账单
exports.getMealBillByHospitalizedId = function (req, res, next) {

  bedMealRecordLogic.getMealBillByHospitalizedId({
    hospitalizedInfoId: req.query.hospitalized_info_id,
    is_checkout: publicLib.booleanParse(req.query.is_checkout) || false
  }, req.pagination, function (err, result) {
    if (err) {
      return next(err);
    }

    req.data = {
      total_count: result.totalCount,
      limit: result.limit,
      bed_meal_bills: result.bedMealRecords
    };
    return next();
  });
};
//病人结账
exports.checkoutByHospitalizedInfo = function (req, res, next) {
  bedMealRecordLogic.checkoutByHospitalizedInfo(req.user, req.hospitalized_info, function (err, result) {
    if (err) {
      return next(err);
    }

    req.data = {
      checkout_count: result.checkoutCount,
      checkout_amount: result.checkoutAmount
    };
    return next();
  });
};

//客户端选餐之前获取选餐设置记录（用于生成筛选条件）
exports.getBedMealRecordsByClient = function (req, res, next) {
  var mealTag = req.query.meal_tag || 'breakfast';//breakfast, lunch, dinner
  var dateTag = req.query.date_tag || 'today';//today,tomorrow

  var todayMealTimeSet = publicLib.parseToDate(new Date());
  if (dateTag === 'tomorrow') {
    todayMealTimeSet.setDate(todayMealTimeSet.getDate() + 1);
  }
  bedMealRecordLogic.getMealRecordsByClientBuildingFloors(req.building, req.floor, todayMealTimeSet, mealTag, function (err, bedMealRecords) {
    if (err) {
      return next(err);
    }

    req.data = {
      bed_meal_records: bedMealRecords
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
exports.saveBedMealRecord = function (req, res, next) {
  if (req.bed_meal_record.is_checkout) {
    return next({err: bedMealRecordError.bed_meal_record_checkout});
  }

  if (req.hospitalized_info.is_leave_hospital) {
    return next({err: bedMealRecordError.leave_hospital});
  }

  var packageMeals = req.body.package_meals || [];
  if (!Array.isArray(packageMeals)) {
    return next({err: bedMealRecordError.invalid_package_meals});
  }

  var selectedPackageMeals = [];
  packageMeals.forEach(function (item) {
    if (item.selected) {
      selectedPackageMeals.push(item);
    }
  });

  var invalidPackageMeals = selectedPackageMeals.filter(function (item) {
    return item.count <= 0;
  });

  if (invalidPackageMeals.length > 0) {
    return next({err: bedMealRecordError.invalid_package_meal_count});
  }

  if (selectedPackageMeals.length === 0) {
    return next({err: bedMealRecordError.no_package_meals});
  }

  bedMealRecordLogic.saveBedMealRecord(req.bed_meal_record, req.meal_type, selectedPackageMeals, function (err, newBedMealRecord) {
    if (err) {
      return next(err);
    }

    req.data = {
      bed_meal_record: newBedMealRecord
    };
    return next();
  });
};

exports.validNewBedInfo = function (req, res, next) {
  req.data = {
    hospitalized_info: req.hospitalized_info
  };
  return next();
};

//交换床位
exports.changeBed = function (req, res, next) {
  var dateTimeStamp = req.body.meal_set_time_stamp;
  var time = new Date();
  if (dateTimeStamp) {
    time = new Date(parseInt(dateTimeStamp));
  }
  var mealSetDate = publicLib.parseToDate(time);

  var currentBedInfo = {
    _id: req.hospitalized_info.bed,
    floor_id: req.hospitalized_info.floor,
    building_id: req.hospitalized_info.building
  };
  var newBedInfo = {
    _id: req.bed._id,
    floor_id: req.bed.floor_id,
    building_id: req.bed.building_id
  };

  async.auto({
    modifyCurrentRecordInfo: function (autoCallback, results) {
      //修改旧床位该时间段之后的记录
      bedMealRecordLogic.modifyMealRecordBed(req.user, mealSetDate, req.hospitalized_info._id, newBedInfo, function (err, count) {
        return autoCallback(err, count);
      });
    },
    modifyCurrentHospitalizedInfo: ['modifyCurrentRecordInfo', function (autoCallback) {
      hospitalizedInfoLogic.modifyHospitalizedInfoBed(req.user, req.hospitalized_info, newBedInfo, function (err, newHospitalizedInfo) {
        return autoCallback(err, newHospitalizedInfo);
      });
    }],
    distHospitalizedInfo: function (autoCallback) {
      var bedId = req.body.bed_id;
      hospitalizedInfoLogic.getHospitalizedInfoByBedId(bedId, function (err, hospitalizedInfo) {
        if (err) {
          return autoCallback(err);
        }

        return autoCallback(null, hospitalizedInfo);
      });
    },
    modifyNewRecordInfo: ['distHospitalizedInfo', function (autoCallback, results) {
      if (!results.distHospitalizedInfo) {
        return autoCallback();
      }

      bedMealRecordLogic.modifyMealRecordBed(req.user, mealSetDate, results.distHospitalizedInfo._id, currentBedInfo, function (err, count) {
        return autoCallback(err, count);
      });
    }],
    modifyNewHospitalizedInfo: ['distHospitalizedInfo', 'modifyNewRecordInfo', function (autoCallback, results) {
      if (!results.distHospitalizedInfo) {
        return autoCallback();
      }

      hospitalizedInfoLogic.modifyHospitalizedInfoBed(req.user, results.distHospitalizedInfo, currentBedInfo, function (err, newHospitalizedInfo) {
        return autoCallback(err, newHospitalizedInfo);
      });
    }]
  }, function (err) {
    if (err) {
      return next();
    }

    req.data = {
      success: true
    };
    return next();
  });
};


exports.deleteBedMealRecord = function (req, res, next) {
  bedMealRecordLogic.deleteBedMealRecord(req.bed_meal_record, function (err) {
    if (err) {
      return next(err);
    }

    req.data = {
      success: true
    };
    return next();
  });
};

exports.getMealStatistics = function (req, res, next) {

    var timeRange = JSON.parse(req.query.time_range) || {};
  var defaultStart = new Date('1970-1-1 00:00:00');
  var startTime = !timeRange.startTime ? defaultStart : (new Date(timeRange.startTime) || defaultStart);
  var endTime = !timeRange.endTime ? new Date() : (new Date(timeRange.endTime) || new Date());

  var floorId = req.query.floor_id || '';

  var buildingIds = [];
  var floorIds = [];
  var bedIds = [];
  var hospitalizedInfoIds = [];

  async.auto({
    getFloor: function (autoCallback) {
      if (!floorId) {
        return autoCallback();
      }

      bedLogic.getFloorById(floorId, function (err, floor) {
        if (err) {
          return autoCallback(err);
        }

        return autoCallback(null, floor);
      });
    },
    getStatistics: ['getFloor', function (autoCallback, results) {
      bedMealRecordLogic.getMealStatistics({
        building: req.building,
        floor: results.getFloor,
        idNumber: req.query.id_number || '',
        startTime: publicLib.parseToDate(startTime),
        endTime: publicLib.parseToDate(endTime)
      }, req.pagination, function (err, result) {
        if (err) {
          return autoCallback(err);
        }

        result.mealStatistic.forEach(function (item) {
          if (buildingIds.indexOf(item.building.toString()) === -1) {
            buildingIds.push(item.building.toString());
          }
          if (floorIds.indexOf(item.floor.toString()) === -1) {
            floorIds.push(item.floor.toString());
          }
          if (bedIds.indexOf(item.bed.toString()) === -1) {
            bedIds.push(item.bed.toString());
          }
          if (hospitalizedInfoIds.indexOf(item.hospitalized_info.toString()) === -1) {
            hospitalizedInfoIds.push(item.hospitalized_info.toString());
          }
          item.meal_day_count = 0;

          item.statistics.forEach(function (statistic) {
            var hasPrice = false;
            statistic.prices.forEach(function (price) {
              if (hasPrice) {
                return;
              }

              if (price.meal_type_price > 0) {
                hasPrice = true;
              }
            });

            if (hasPrice) {
              item.meal_day_count++;
            }
          });
        });
        return autoCallback(err, result);
      });
    }],
    loadFloorDic: ['getStatistics', function (autoCallback, results) {
      var dic = {};
      if (results.getFloor) {
        dic[results.getFloor._id.toString()] = results.getFloor;
        return autoCallback(null, dic);
      }

      bedLogic.getFloorsByIds(floorIds, function (err, floors) {
        if (err) {
          return autoCallback(err);
        }

        floors.forEach(function (item) {
          dic[item._id.toString()] = item;
        });

        return autoCallback(null, dic);
      });
    }],
    loadBedDic: ['getStatistics', function (autoCallback) {
      bedLogic.getBedsByIds(hospitalizedInfoIds, function (err, beds) {
        if (err) {
          return autoCallback(err);
        }

        var dic = {};
        beds.forEach(function (item) {
          dic[item._id.toString()] = item;
        });
        return autoCallback(null, dic);
      });
    }],
    loadHospitalizedInfoDic: ['getStatistics', function (autoCallback) {
      hospitalizedInfoLogic.getHospitalizedInfoByIds(hospitalizedInfoIds, function (err, hospitalizedInfos) {
        if (err) {
          return autoCallback(err);
        }

        var dic = {};
        hospitalizedInfos.forEach(function (item) {
          dic[item._id.toString()] = item;
        });
        return autoCallback(null, dic);
      });
    }],
    generateStatistic: ['getStatistics', 'loadFloorDic', 'loadBedDic', 'loadHospitalizedInfoDic', function(autoCallback, results){
      var totalDays = 0;
      var mealDayCount = 0;
      results.getStatistics.mealStatistic.forEach(function (item) {
        totalDays += item.day_count;
        mealDayCount += item.meal_day_count;

        item.bed_info = req.building.name;
        var f = results.loadFloorDic[item.floor.toString()];
        if(f){
          item.bed_info += f.name;
        }
        var b = results.loadBedDic[item.bed.toString()];
        if(b){
          item.bed_info += b.name;
        }
        var h = results.loadHospitalizedInfoDic[item.hospitalized_info.toString()];
        if(h){
          item.is_leave_hospital = h.is_leave_hospital;
          item.leave_hospital_time = h.leave_hospital_time;
          item.is_hospitalized = h.is_hospitalized;
          item.hospitalized_time = h.hospitalized_time;
        }
        delete item.statistics;
      });
      results.getStatistics.total_day = totalDays;
      results.getStatistics.meal_day_count = mealDayCount;
      return autoCallback(null, results.getStatistics);
    }],
  }, function (err, results) {
    if (err) {
      return next(err);
    }

    req.data = {
      total_day: results.generateStatistic.total_day,
      meal_day_count: results.generateStatistic.meal_day_count,
      limit: results.generateStatistic.limit,
      meal_statistics: results.generateStatistic.mealStatistic
    };
    return next();
  });
};