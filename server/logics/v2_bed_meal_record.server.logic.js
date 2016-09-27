/**
 * Created by elinaguo on 16/7/4.
 */
'use strict';
var async = require('async');
var bedMealRecordError = require('../errors/v2_bed_meal_record'),
  systemError = require('../errors/system');
var mongoLib = require('../libraries/mongoose'),
  publicLib = require('../libraries/public');
var appDb = mongoLib.appDb;
var BedMealRecord = appDb.model('BedMealRecordV2'),
  MealBill = appDb.model('MealBill');

function formatBedMealRecordInfos(hospitalizedInfoDic, mealTypeDic, bedMealRecordInfo, callback) {
  bedMealRecordInfo.bedId = bedMealRecordInfo.bed_id;
  bedMealRecordInfo.hospitalizedInfo = hospitalizedInfoDic[bedMealRecordInfo.hospitalizedInfoId];

  if (!bedMealRecordInfo.hospitalizedInfo) {
    return callback({err: bedMealRecordError.not_all_hospitalized_info_exist});
  }

  if (bedMealRecordInfo.hospitalizedInfo.is_leave_hospital) {
    return callback({err: bedMealRecordError.has_left_hospital_sicker});
  }

  bedMealRecordInfo.mealBills = [];
  if (!bedMealRecordInfo.mealTypeId) {//如果选择无，或没有选择，mealBills变为空
    return callback();
  }

  var mealType = mealTypeDic[bedMealRecordInfo.mealTypeId];
  if (!mealType) {//如果选择了，餐种类型不存在出错
    return callback({err: bedMealRecordError.not_all_meal_type_exist});
  }
  bedMealRecordInfo.mealType = mealType;

  var mealPrice = publicLib.amountParse(mealType[bedMealRecordInfo.mealTag + '_price']);
  bedMealRecordInfo.mealPrice = mealPrice;
  if (!mealType.need_choose_package_meal) {//不是普通则待选
    if (mealPrice < 0) {
      return callback({err: bedMealRecordError.not_all_meal_type_has_price});
    }
    bedMealRecordInfo.mealBills.push(new MealBill({
      name: mealType.name,
      price: mealPrice,
      count: 1
    }));
  }

  bedMealRecordInfo.needChoosePackageMeal = mealType.need_choose_package_meal;

  return callback();
}

function validMealRecordInfos(hospitalizedInfoDic, mealTypeDic, building, floor, bedMealRecordInfos, mealSetDate, callback) {
  async.forEach(bedMealRecordInfos, function (bedMealRecordInfo, eachCallback) {
    formatBedMealRecordInfos(hospitalizedInfoDic, mealTypeDic, bedMealRecordInfo, function (err) {
      if (err) {
        return eachCallback(err);
      }

      BedMealRecord.findOne({
        meal_set_date: mealSetDate,                                 //同一天
        hospitalized_info: bedMealRecordInfo.hospitalizedInfo._id,  //同一个入住病人
        building: building._id,
        floor: floor._id,
        bed: bedMealRecordInfo.bed_id,                              //同一个床位
        meal_tag: bedMealRecordInfo.mealTag,                        //同一个饭点
        deleted_status: false
      }).exec(function (err, bedMealRecord) {
        if (err) {
          return eachCallback({err: systemError.database_query_error});
        }

        if (bedMealRecord && bedMealRecord.is_checkout) {
          return eachCallback({err: bedMealRecordError.bed_meal_record_has_checkout});
        }

        return eachCallback();
      });
    });
  }, function (err) {
    return callback(err);
  });
}

exports.batchSaveBedMealRecord = function (user, hospitalizedInfoDic, mealTypeDic, building, floor, mealSetDate, bedMealRecordInfos, callback) {

  validMealRecordInfos(hospitalizedInfoDic, mealTypeDic, building, floor, bedMealRecordInfos, mealSetDate, function (err) {
    if (err) {
      return callback(err);
    }

    var existCount = 0;
    var newCount = 0;
    async.forEach(bedMealRecordInfos, function (bedMealRecordInfo, eachCallback) {
      var query = {
        meal_set_date: mealSetDate,                                 //同一天
        hospitalized_info: bedMealRecordInfo.hospitalizedInfo._id,  //同一个入住病人
        building: building._id,
        floor: floor._id,
        bed: bedMealRecordInfo.bed_id,                                               //同一个床位
        meal_tag: bedMealRecordInfo.mealTag,                        //同一个饭点
        deleted_status: false
      };
      BedMealRecord.findOne(query).exec(function (err, bedMealRecord) {
        if (err) {
          return eachCallback({err: systemError.database_query_error});
        }

        var isNew = false;
        if (!bedMealRecord) {
          bedMealRecord = new BedMealRecord(query);
          bedMealRecord.create_user = user._id;
          isNew = true;
        }

        bedMealRecord.need_choose_package_meal = bedMealRecordInfo.needChoosePackageMeal;
        bedMealRecord.meal_bills = bedMealRecordInfo.mealBills;
        bedMealRecord.id_number = bedMealRecordInfo.hospitalizedInfo.id_number;
        bedMealRecord.nickname = bedMealRecordInfo.hospitalizedInfo.nickname;
        bedMealRecord.meal_type_id = bedMealRecordInfo.mealTypeId ? bedMealRecordInfo.mealTypeId : null;
        bedMealRecord.meal_type_name = bedMealRecordInfo.mealType ? bedMealRecordInfo.mealType.name : '';
        bedMealRecord.meal_type_price = bedMealRecordInfo.mealPrice || 0;

        bedMealRecord.save(function (err, newBedMealRecord) {
          if (err || !newBedMealRecord) {
            return eachCallback({err: systemError.database_save_error});
          }

          if (isNew) {
            newCount++;
          } else {
            existCount++;
          }
          return eachCallback();
        });
      });
    }, function (err) {
      if (err) {
        return callback(err);
      }


      return callback(null, {
        successCount: existCount + newCount,
        newCount: newCount,
        existCount: existCount
      });
    });
  });
};

function queryMealBedRecords(filter, populateText, callback) {
  populateText = populateText || '';
  BedMealRecord.find(filter)
    .populate(populateText)
    .exec(function (err, bedMealRecords) {
      if (err) {
        return callback({err: systemError.database_query_error});
      }

      return callback(null, bedMealRecords);
    });
}

exports.getMealBedRecordsByMealDate = function (building, floor, mealSetDate, callback) {
  queryMealBedRecords({
    meal_set_date: mealSetDate,
    building: building._id,
    floor: floor._id,
    deleted_status: false
  }, 'hospitalized_info', function (err, bedMealRecords) {
    return callback(null, bedMealRecords);
  });
};

exports.getMealBedRecordsByMealDateAndTag = function (building, floor, beds, mealSetDate, mealTag, callback) {
  queryMealBedRecords({
    meal_set_date: mealSetDate,
    meal_tag: mealTag,
    building: building._id,
    floor: floor._id,
    bed: {$in: beds},
    deleted_status: false
  }, 'hospitalized_info meal_type_id', function (err, bedMealRecords) {
    return callback(null, bedMealRecords);
  });
};

function queryOneBedMealRecord(filter, callback) {
  BedMealRecord.findOne(filter)
    .exec(function (err, bedMealRecord) {
      if (err) {
        return callback({err: systemError.database_query_error});
      }

      return callback(null, bedMealRecord);
    });
}

function createMealTagByPreviousRecord(previousBedMealRecord, mealSetDate, mealTag, callback) {
  queryOneBedMealRecord({
    meal_set_date: mealSetDate,
    meal_tag: mealTag,
    building: previousBedMealRecord.building,
    floor: previousBedMealRecord.floor,
    bed: previousBedMealRecord.bed,
    hospitalized_info: previousBedMealRecord.hospitalized_info._id,
    deleted_status: false
  }, function (err, mealBedRecord) {
    if (err) {
      return callback(err);
    }

    if (mealBedRecord && mealBedRecord.is_checkout) {
      return callback();
    }

    if (!mealBedRecord) {
      mealBedRecord = new BedMealRecord({
        meal_set_date: mealSetDate,
        meal_tag: mealTag,
        building: previousBedMealRecord.building,
        floor: previousBedMealRecord.floor,
        bed: previousBedMealRecord.bed,
        hospitalized_info: previousBedMealRecord.hospitalized_info._id
      });
    }

    mealBedRecord.meal_type_id = previousBedMealRecord.meal_type_id._id;
    mealBedRecord.meal_type_name = previousBedMealRecord.meal_type_id.name;

    mealBedRecord.id_number = previousBedMealRecord.hospitalized_info.id_number;
    mealBedRecord.nickname = previousBedMealRecord.hospitalized_info.nickname;

    mealBedRecord.meal_bills = [];
    if (!previousBedMealRecord.meal_type_id.need_choose_package_meal) {
      var mealPrice = previousBedMealRecord.meal_type_id[mealTag + '_price'];
      mealBedRecord.meal_bills.push(new MealBill({
        name: previousBedMealRecord.meal_type_id.name,
        price: mealPrice,
        count: 1
      }));
      mealBedRecord.meal_type_price = mealPrice;
    }
    else {
      mealBedRecord.meal_type_price = 0;
    }
    mealBedRecord.need_choose_package_meal = previousBedMealRecord.meal_type_id.need_choose_package_meal;
    mealBedRecord.save(function (err, newMealBedRecord) {
      if (err || !newMealBedRecord) {
        return callback({err: systemError.database_save_error});
      }

      return callback(null, newMealBedRecord);
    });
  });
}

exports.copyCreateByPreviousDinnerMealRecording = function (previousBedMealRecord, mealSetDate, callback) {
  async.auto({
    createBreakfast: function (autoCallback) {
      createMealTagByPreviousRecord(previousBedMealRecord, mealSetDate, 'breakfast', function (err) {
        return autoCallback(err);
      });
    },
    createLunch: function (autoCallback) {
      createMealTagByPreviousRecord(previousBedMealRecord, mealSetDate, 'lunch', function (err) {
        return autoCallback(err);
      });
    },
    createDinner: function (autoCallback) {
      createMealTagByPreviousRecord(previousBedMealRecord, mealSetDate, 'dinner', function (err) {
        return autoCallback(err);
      });
    },
  }, function (err) {
    return callback(err);
  });
};

exports.getMealBillByFilter = function (filter, pagination, callback) {
  var query = {
    deleted_status: false
  };

  filter = filter || {};

  if (filter.startTime && filter.endTime) {
    query.$and = [{meal_set_date: {$gte: filter.startTime}}, {meal_set_date: {$lte: filter.endTime}}];
  }

  if (filter.mealTag) {
    query.meal_tag = filter.mealTag;
  }

  if (filter.mealTypeId && mongoLib.isObjectId(filter.mealTypeId)) {
    query.meal_type_id = mongoLib.generateNewObjectId(filter.mealTypeId);
  }

  if (filter.idNumber) {
    query.id_number = {$regex: filter.idNumber, $options: '$i'};
  }

  if (filter.buildingId) {
    query.building = mongoLib.generateNewObjectId(filter.buildingId);
  }

  if (filter.floorId) {
    query.floor = mongoLib.generateNewObjectId(filter.floorId);
  }

  BedMealRecord.aggregate([{
    $match: query
  }, {
    $group: {
      _id: '$object',
      total_count: {$sum: 1},
      total_amount: {$sum: '$amount_paid'}
    }
  }], function (err, result) {
    if (err || !result) {
      return callback({err: systemError.database_query_error});
    }

    if (result.length === 0) {
      result[0] = {
        total_count: 0,
        total_amount: 0
      };
    }

    if (pagination.limit === -1) {
      pagination.limit = result[0].total_count;
    }

    if (pagination.skip_count === -1) {
      pagination.skip_count = pagination.limit * (pagination.current_page - 1);
    }

    BedMealRecord.find(query)
      .sort({update_time: -1})
      .skip(pagination.skip_count)
      .limit(pagination.limit)
      .populate('building floor bed')
      .exec(function (err, bedMealRecords) {
        if (err || !bedMealRecords) {
          return callback({err: systemError.database_query_error});
        }


        return callback(null, {
          bedMealRecords: bedMealRecords,
          limit: pagination.limit,
          totalCount: result[0].total_count,
          totalAmount: result[0].total_amount
        });
      });
  });
};

exports.getMealBills = function (filter, callback) {
  var query = {
    deleted_status: false
  };

  filter = filter || {};

  if (filter.startTime && filter.endTime) {
    query.$and = [{meal_set_date: {$gte: filter.startTime}}, {meal_set_date: {$lte: filter.endTime}}];
  }

  if (filter.mealTag) {
    query.meal_tag = filter.mealTag;
  }

  if (filter.mealTypeId && mongoLib.isObjectId(filter.mealTypeId)) {
    query.meal_type_id = mongoLib.generateNewObjectId(filter.mealTypeId);
  }

  if (filter.idNumber) {
    query.id_number = {$regex: filter.idNumber, $options: '$i'};
  }

  if (filter.buildingId) {
    query.building = filter.buildingId;
  }
  if (filter.floorId) {
    query.floor = filter.floorId;
  }

  BedMealRecord.find(query)
    .sort({floor: 1, bed: 1, time_tag: 1})
    .populate('building floor bed')
    .exec(function (err, bedMealRecords) {
      if (err || !bedMealRecords) {
        return callback({err: systemError.database_query_error});
      }


      return callback(null, bedMealRecords);
    });
};

exports.getMealBillByHospitalizedId = function (filter, pagination, callback) {


  filter = filter || {};

  var query = {
    deleted_status: false
  };

  if (filter.hospitalizedInfoId && mongoLib.isObjectId(filter.hospitalizedInfoId)) {
    query.hospitalized_info = mongoLib.generateNewObjectId(filter.hospitalizedInfoId);
  }


  BedMealRecord.count(query, function (err, totalCount) {
    if (err) {
      return callback({err: systemError.database_query_error});
    }

    if (pagination.limit === -1) {
      pagination.limit = totalCount;
    }

    if (pagination.skip_count === -1) {
      pagination.skip_count = pagination.limit * (pagination.current_page - 1);
    }

    BedMealRecord.find(query)
      .sort({update_time: -1})
      .skip(pagination.skip_count)
      .limit(pagination.limit)
      .populate('building floor bed')
      .exec(function (err, bedMealRecords) {
        if (err || !bedMealRecords) {
          return callback({err: systemError.database_query_error});
        }


        return callback(null, {
          bedMealRecords: bedMealRecords,
          limit: pagination.limit,
          totalCount: totalCount
        });
      });
  });
};

exports.checkoutByHospitalizedInfo = function (user, hospitalizedInfo, callback) {
  var checkoutTime = new Date();
  BedMealRecord.find({
    hospitalized_info: hospitalizedInfo._id,
    deleted_status: false,
    is_checkout: false
  }).exec(function (err, bedMealRecords) {
    if (err) {
      return callback({err: systemError.database_query_error});
    }

    var checkoutCount = 0;
    var checkoutAmount = 0;
    async.each(bedMealRecords, function (bedMealRecord, eachCallback) {
      bedMealRecord.is_checkout = true;
      bedMealRecord.checkout_time = checkoutTime;
      bedMealRecord.checkout_create_id = user._id;
      bedMealRecord.checkout_creator_info = {
        username: user.username,
        nickname: user.nickname
      };
      bedMealRecord.save(function (err, savedBedMealRecord) {
        if (err || !savedBedMealRecord) {
          return eachCallback({err: systemError.database_save_error});
        }

        checkoutAmount += bedMealRecord.amount_paid;
        checkoutCount++;
        return eachCallback(null, savedBedMealRecord);
      });
    }, function (err) {
      return callback(err, {
        checkoutCount: checkoutCount,
        checkoutAmount: checkoutAmount
      });
    });
  });
};

exports.getMealRecordsByClientBuildingFloors = function (building, floor, mealSetDate, mealTag, callback) {

  var match = {
    meal_set_date: mealSetDate,
    meal_tag: mealTag,
    building: building._id,
    floor: floor._id,
    deleted_status: false,
    is_checkout: false,
    need_choose_package_meal: 'true'
  };

  BedMealRecord.find(match)
    .populate('bed meal_type_id')
    .exec(function (err, bedMealRecords) {
      if (err || !bedMealRecords) {
        return callback({err: systemError.database_query_error});
      }

      return callback(null, bedMealRecords);
    });
};

function formatPackageMeals(mealType, selectedPackageMeals, callback) {
  async.each(selectedPackageMeals, function (selectedPackageMeal, eachCallback) {

    var packageMeals = mealType.package_meals.filter(function (item) {
      return item.name === selectedPackageMeal.name;
    });
    var packageMeal = packageMeals[0];
    if (!packageMeal) {
      return eachCallback({err: bedMealRecordError.package_meal_not_exist});
    }

    selectedPackageMeal.price = packageMeal.price;
    return eachCallback();
  }, function (err) {
    return callback(err);
  });
}

exports.saveBedMealRecord = function (bedMealRecord, mealType, selectedPackageMeals, callback) {

  formatPackageMeals(mealType, selectedPackageMeals, function (err) {
    if (err) {
      return callback(err);
    }

    var mealBills = selectedPackageMeals.map(function (item) {
      return new MealBill({
        name: item.name,
        price: item.price,
        count: item.count
      });
    });

    bedMealRecord.meal_bills = mealBills;
    bedMealRecord.markModified('meal_bills');
    bedMealRecord.save(function (err, bedMealRecord) {
      if (err || !bedMealRecord) {
        return callback({err: systemError.database_save_error});
      }

      return callback(null, bedMealRecord)
    });
  });
};

exports.needChoosePackageMealTypes = function (building, mealTag, mealSetDate, callback) {
  BedMealRecord.find({
    meal_set_date: mealSetDate,
    meal_tag: mealTag,
    building: building._id,
    need_choose_package_meal: 'true',
    deleted_status: false
  }).populate('floor bed hospitalized_info').exec(function (err, bedMealRecords) {
    if (err) {
      return callback({err: systemError.database_query_error});
    }

    return callback(null, bedMealRecords);
  });
};

exports.getBedMealRecordsById = function (id, callback) {
  BedMealRecord.findOne({
    _id: id
  }).exec(function (err, bedMealRecord) {
    if (err) {
      return callback({err: systemError.database_query_error});
    }

    return callback(null, bedMealRecord);
  });
};


exports.modifyMealRecordBed = function (user, mealSetDate, hospitalizedInfoId, newBedInfo, callback) {
  var query = {
    meal_set_date: {$gte: mealSetDate},
    hospitalized_info: hospitalizedInfoId,
    deleted_status: false
  };

  BedMealRecord.find(query).exec(function (err, bedMealRecords) {
    if (err || !bedMealRecords) {
      return callback({err: systemError.database_query_error});
    }

    var count = 0;
    async.each(bedMealRecords, function (bedMealRecord, eachCallback) {
      bedMealRecord.building = newBedInfo.building_id;
      bedMealRecord.floor = newBedInfo.floor_id;
      bedMealRecord.bed = newBedInfo._id;
      bedMealRecord.change_user = user._id;
      bedMealRecord.save(function (err, newBedMealRecord) {
        if (err || !newBedMealRecord) {
          return eachCallback({err: systemError.database_save_error});
        }
        count++;
        return eachCallback();
      });
    }, function (err) {
      return callback(err, count);
    });
  });
};

exports.getTotalAmountByHospitalizedInfoId = function (hospitalizedInfoId, callback) {
  var match = {
    deleted_status: false,
    is_checkout: false,
    hospitalized_info: hospitalizedInfoId
  };

  BedMealRecord.aggregate([{
    $match: match
  }, {
    $group: {
      _id: '$object',
      total_amount: {$sum: '$amount_paid'}
    }
  }], function (err, result) {
    if (err || !result) {
      return callback({err: systemError.database_query_error});
    }

    if (result.length === 0) {
      return callback(null, 0);
    }

    return callback(null, result[0].total_amount);
  });
};

exports.deleteBedMealRecord = function (bedMealRecord, callback) {
  if (bedMealRecord.deleted_status) {
    return callback({err: bedMealRecordError.bed_meal_record_deleted});
  }

  if (bedMealRecord.is_checkout) {
    return callback({err: bedMealRecordError.bed_meal_record_checkout});
  }

  bedMealRecord.deleted_status = true;
  bedMealRecord.save(function (err, newBedMealRecord) {
    if (err) {
      return callback({err: systemError.database_save_error});
    }

    return callback(null, newBedMealRecord);
  });
};

exports.getMealStatistics = function (filter, pagination, callback) {
  var match = {
    deleted_status: false,
    building: filter.building._id
  };

  if (filter.floor) {
    match.floor = filter.floor._id;
  }

  if (filter.startTime && filter.endTime) {
    match.$and = [{meal_set_date: {$gte: filter.startTime}}, {meal_set_date: {$lte: filter.endTime}}];
  }

  if (filter.idNumber) {
    match.id_number = {$regex: filter.idNumber, $options: '$i'};
  }

  BedMealRecord.aggregate([{$match:match},{
    $group: {
      _id: '$hospitalized_info'
    }
  }], function(err, infoResult){
    if(err){
      return callback(err);
    }

    var totalCount = infoResult.length;

    if (pagination.limit === -1) {
      pagination.limit = totalCount;
    }

    if (pagination.skip_count === -1) {
      pagination.skip_count = pagination.limit * (pagination.current_page - 1);
    }

    BedMealRecord.aggregate([{
      $match: match
    }, {
      $group: {
        _id: {
          hospitalized_info: '$hospitalized_info',
          meal_set_date: '$meal_set_date',
          meal_tag: '$meal_tag',
          meal_type_price: '$meal_type_price'
        },
        hospitalized_info: {$first: '$hospitalized_info'},
        meal_set_date: {$first: '$meal_set_date'},
        meal_tag: {$first: '$meal_tag'},
        meal_type_price: {$first: '$meal_type_price'},
        id_number: {$first: '$id_number'},
        nickname: {$first: '$nickname'},
        building: {$first: '$building'},
        floor: {$first: '$floor'},
        bed: {$first: '$bed'}
      }
    }, {
      $group: {
        _id: {
          hospitalized_info: '$hospitalized_info',
          meal_set_date: '$meal_set_date'
        },
        id_number: {$first: '$id_number'},
        hospitalized_info: {$first: '$hospitalized_info'},
        meal_set_date: {$first: '$meal_set_date'},
        nickname: {$first: '$nickname'},
        building: {$first: '$building'},
        floor: {$first: '$floor'},
        bed: {$first: '$bed'},
        prices: {
          $push: {
            meal_tag: '$meal_tag',
            meal_type_price: '$meal_type_price'
          }
        }
      }
    }, {
      $group: {
        _id: '$hospitalized_info',
        id_number: {$first: '$id_number'},
        nickname: {$first: '$nickname'},
        building: {$first: '$building'},
        floor: {$first: '$floor'},
        bed: {$first: '$bed'},
        hospitalized_info: {$first: '$hospitalized_info'},
        meal_set_date: {$first: '$meal_set_date'},
        day_count: {$sum: 1},
        statistics: {
          $push: {
            meal_set_date: '$meal_set_date',
            prices: '$prices'
          }
        }
      }
    }, {
      $skip: pagination.skip_count
    }, {
      $limit: pagination.limit
    }], function (err, result) {
      if (err) {
        return callback(err);
      }

      return callback(null, {
        totalCount: totalCount,
        limit: pagination.limit,
        currentPage: pagination.current_page,
        mealStatistic: result
      });
    });
  });
};