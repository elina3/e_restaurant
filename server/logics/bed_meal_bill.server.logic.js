/**
 * Created by elinaguo on 16/6/25.
 */
'use strict';
var async = require('async');
var mongooseLib = require('../libraries/mongoose');
var appDb = mongooseLib.appDb;
var BedMealBill = appDb.model('BedMealBill'),
  BedMealBillCheckout = appDb.model('BedMealBillCheckout');

var systemError = require('../errors/system'),
  bedMealBillError = require('../errors/bed_meal_bill');

var mealTags = ['breakfast', 'lunch', 'dinner'];

function parseToDate(time) {
  if (!time) {
    time = new Date();
  }
  return new Date(time.toDateString());
}

function upsertBedMealBillForMealTag(user, bedMealRecord, mealTag, goodsBills, callback) {
  var query = {
    bed_meal_record: bedMealRecord._id,
    meal_tag: mealTag,
    deleted_status: false
  };
  BedMealBill.findOne(query)
    .exec(function (err, bedMealBill) {
      if (err) {
        console.log('upsertBedMealBillForMealTag error  database_query_error');
        return callback({err: systemError.database_query_error});
      }

      //不存在账单，没有选择不做任何事情
      if (!bedMealBill && !bedMealRecord[mealTag]) {
        console.log('upsertBedMealBillForMealTag error  不存在账单,没有选择不做任何事情');
        return callback();
      }

      if (bedMealBill && bedMealBill.is_checkout) {
        console.log('upsertBedMealBillForMealTag  is_checkout');
        return callback({err: bedMealBillError.checkout});
      }

      var userInfo = {
        username: user.username,
        nickname: user.nickname,
        user_model: user.user_model
      };
      if (!bedMealBill) {
        bedMealBill = new BedMealBill({
          building: bedMealRecord.building,
          floor: bedMealRecord.floor,
          bed: bedMealRecord.bed,
          hospitalized_info: bedMealRecord.hospitalized_info._id,
          bed_meal_record: bedMealRecord._id,
          meal_set_date: bedMealRecord.meal_set_date,
          meal_tag: mealTag,
          id_number: bedMealRecord.hospitalized_info.id_number,
          nickname: bedMealRecord.hospitalized_info.nickname,
          is_checkout: false,
          creator_id: user._id,
          creator_info: userInfo
        });
        console.log('new insert');
      }

      bedMealBill.recent_modify_user_id = user._id;
      bedMealBill.recent_modify_user_info = userInfo;


      bedMealBill.goods_bills = goodsBills;
      bedMealBill.meal_type = bedMealRecord[mealTag];

      bedMealBill.save(function (err, newBedMealBill) {
        if (err || !newBedMealBill) {

          console.log('save error');
          return callback({err: systemError.database_save_error});
        }

        console.log('save success');

        return callback(null, newBedMealBill);
      });
    });
}

function batchCreateBillsByBedMealRecord(user, bedMealRecord, healthyMeals, callback) {
  console.log('batch inner logic async start');
  async.eachSeries(mealTags, function (mealTag, eachCallback) {
    var goodsBills = [];

    var mealType = bedMealRecord[mealTag];
    if (mealType === 'healthy_normal' || mealType === '') {
      goodsBills = [];
    } else {
      var healthyGoodsInfo = healthyMeals[mealType];
      if (!healthyGoodsInfo) {
        console.log('error  healthy_goods_not_all_exist 1');
        return eachCallback({err: bedMealBillError.healthy_goods_not_all_exist});
      }
      if (healthyGoodsInfo) {//选了，但是不是选择普食
        goodsBills = getGoodsBills([healthyGoodsInfo]);
      }

      if (goodsBills.length === 0) {
        console.log('error  healthy_goods_not_all_exist');
        return eachCallback({err: bedMealBillError.healthy_goods_not_all_exist});
      }
    }

    user.user_model = 'User';
    console.log('upsertBedMealBillForMealTag start');
    upsertBedMealBillForMealTag(user, bedMealRecord, mealTag, goodsBills, function (err, bedMealBill) {
      console.log('upsertBedMealBillForMealTag end');
      return eachCallback();//批量插入不处理错误
    });
  }, function (err) {
    console.log('batch inner logic async end');
    return callback(err);
  });
}

//护士为病人设置营养餐时生成账单
exports.batchCreateMealBills = function (user, bedMealRecords, healthyMeals, callback) {
  console.log('batch create meal bill logic async begin');
  async.each(bedMealRecords, function (bedMealRecord, eachCallback) {
    batchCreateBillsByBedMealRecord(user, bedMealRecord, healthyMeals, function (err) {
      return eachCallback(err);
    });
  }, function (err) {
    console.log('batch create meal bill logic async end');
    return callback(err);
  });
};

function getGoodsBills(goodsInfos) {
  if (!Array.isArray(goodsInfos)) {
    return [];
  }
  var goodsList = goodsInfos.map(function (goodsInfo) {
    return {
      goods_id: goodsInfo.goods_id,
      name: goodsInfo.name,
      description: goodsInfo.description,
      display_photos: goodsInfo.display_photos,
      status: goodsInfo.status,
      price: goodsInfo.price, //单价：分
      count: goodsInfo.count
    };
  });
  return goodsList;
}
//食堂工作人员为某床病人选餐
exports.chooseGoodsBillForBedMealRecord = function (client, bedMealRecord, mealTag, goodsInfos, callback) {
  client.user_model = 'Client';
  upsertBedMealBillForMealTag(client, bedMealRecord, mealTag, goodsInfos, function (err, bedMealBill) {
    if (err) {
      return callback(err);
    }

    return callback(null, bedMealBill);
  });
};

//清算
exports.checkoutByHospitalizedInfoId = function (user, hospitalizedInfo, callback) {
  var today = new Date();
  var query = {
    deleted_status: false,
    is_checkout: false,
    hospitalized_info: hospitalizedInfo._id
  };

  BedMealBill.find(query)
    .exec(function (err, bedMealBills) {
      if (err || !bedMealBills) {
        return callback({err: systemError.database_query_error});
      }

      var amountDue = 0;
      var amountPaid = 0;
      var checkoutCount = 0;
      var checkoutMealBills = [];
      async.each(bedMealBills, function (bedMealBill, eachCallback) {
        if (bedMealBill.meal_set_date > today) {
          return eachCallback();
        }

        bedMealBill.is_checkout = true;
        bedMealBill.checkout_creator_id = user._id;
        bedMealBill.checkout_creator_info = {
          username: user.username,
          nickname: user.nickname
        };
        bedMealBill.save(function (err, savedBedMealBill) {
          if (err || !savedBedMealBill) {
            return eachCallback({err: systemError.database_save_error});
          }

          amountDue += savedBedMealBill.amount_due;
          amountPaid += savedBedMealBill.amount_paid;
          checkoutCount++;
          checkoutMealBills.push(savedBedMealBill);
          return eachCallback();
        });
      }, function (err) {
        //错误不处理，返回已结清的数据

        var bedMealBillCheckout = new BedMealBillCheckout({
          building: hospitalizedInfo.building,
          floor: hospitalizedInfo.floor,
          bed: hospitalizedInfo.bed,
          hospitalized_info: hospitalizedInfo._id,
          bills: checkoutMealBills,
          creator_id: user._id,
          checkout_creator_info: {
            username: user.username,
            nickname: user.nickname
          }
        });
        bedMealBillCheckout.save(function (err, newBedMealBillCheckout) {
          if (err || !newBedMealBillCheckout) {
            console.log('bedMealBillCheckout save error');
          }

          return callback(null, {
            amountDue: amountDue,
            amountPaid: amountPaid,
            checkoutCount: checkoutCount,
            bedMealBills: checkoutMealBills,
            bedMealBillCheckout: newBedMealBillCheckout
          });
        });
      });
    });
};

//获取未结算总金额
exports.getTotalAmountByHospitalizedInfoId = function (hospitalizedInfoId, callback) {
  var match = {
    deleted_status: false,
    is_checkout: false,
    hospitalized_info: hospitalizedInfoId,
    meal_set_date: {$lt: new Date()},
    $or: [{is_cancel: false}, {is_cancel: {$exists: false}}]
  };

  BedMealBill.aggregate([{
    $match: match
  }, {
    $group: {
      _id: '$hospitalized_info',
      bed_meal_bills: {$push: '$$ROOT'},
      total_amount: {$sum: '$amount_paid'}
    }
  }], function (err, result) {
    if (err || !result) {
      return callback({err: systemError.database_query_error});
    }

    if (result.length === 0) {
      return callback(null, 0);
    }

    return callback(null, result[0]);
  });
};

exports.cancelPrepareBill = function (user, hospitalizedInfo, callback) {
  var match = {
    deleted_status: false,
    is_checkout: false,
    hospitalized_info: hospitalizedInfo._id,
    meal_set_date: {$gte: new Date()},
    $or: [{is_cancel: false}, {is_cancel: {$exists: false}}]
  };

  BedMealBill.find(match)
    .exec(function (err, bedMealBills) {
      if (err || !bedMealBills) {
        return callback({err: systemError.database_query_error});
      }

      if (bedMealBills.length === 0) {
        return callback();
      }

      async.forEach(bedMealBills, function (bedMealBill, eachCallback) {
        bedMealBill.is_cancel = true;
        bedMealBill.cancel_creator = user._id;
        bedMealBill.cancel_creator_info = {
          username: user.username,
          nickname: user.nickname
        };
        bedMealBill.save(function (err, newBedBill) {
          if (err || !newBedBill) {
            return eachCallback({err: systemError.database_save_error});
          }

          return eachCallback();
        });
      }, function (err) {
        return callback(err);
      });
    });
};

//根据条件获取账单
exports.getMealBillByFilter = function (filter, pagination, callback) {
  var query = {
    deleted_status: false
  };

  filter = filter || {};

  if (filter.status === 'un_paid') {
    query.is_checkout = false;
  } else if (filter.status === 'paid') {
    query.is_checkout = true;
  }

  if (filter.hospitalizedInfo) {
    query.hospitalized_info = filter.hospitalizedInfo._id;
  }

  if (filter.startTime && filter.endTime) {
    query.$and = [{meal_set_date: {$gte: parseToDate(filter.startTime)}}, {meal_set_date: {$lte: parseToDate(filter.endTime)}}];
  }

  if (filter.mealTag) {
    query.meal_tag = filter.mealTag;
  }

  if (filter.mealType) {
    query.meal_type = filter.mealType;
  }

  if (filter.idNumber) {
    query.id_number = {$regex: filter.idNumber, $options: '$i'};
  }

  BedMealBill.count(query, function (err, totalCount) {
    if (err) {
      return callback({err: systemError.database_query_error});
    }

    if (pagination.limit === -1) {
      pagination.limit = totalCount;
    }

    if (pagination.skip_count === -1) {
      pagination.skip_count = pagination.limit * (pagination.current_page - 1);
    }

    BedMealBill.find(query)
      .sort({update_time: -1})
      .skip(pagination.skip_count)
      .limit(pagination.limit)
      .populate('building floor bed')
      .exec(function (err, bedMealBills) {
        if (err || !bedMealBills) {
          return callback({err: systemError.database_query_error});
        }

        return callback(null, {
          bedMealBills: bedMealBills,
          limit: pagination.limit,
          totalCount: totalCount
        });
      });
  });
};

exports.getBedMealBillTotalAmount = function (filter, callback) {
  var match = {
    deleted_status: false,
    $or: [{is_cancel: false}, {is_cancel: {$exists: false}}]
  };

  filter = filter || {};

  if (filter.status === 'un_paid') {
    query.is_checkout = false;
  } else if (filter.status === 'paid') {
    query.is_checkout = true;
  }

  if (filter.startTime && filter.endTime) {
    match.$and = [{meal_set_date: {$gte: parseToDate(filter.startTime)}}, {meal_set_date: {$lte: parseToDate(filter.endTime)}}];
  }

  if (filter.mealTag) {
    match.meal_tag = filter.mealTag;
  }

  if (filter.mealType) {
    match.meal_type = filter.mealType;
  }

  if (filter.idNumber) {
    match.id_number = {$regex: filter.idNumber, $options: '$i'};
  }

  BedMealBill.aggregate([{
    $match: match
  }, {
    $group: {
      _id: '$object',
      totalAmount: {$sum: '$amount_paid'}
    }
  }], function (err, result) {
    if (err || !result) {
      return callback({err: systemError.database_query_error});
    }

    if (result.length === 0) {
      result[0] = {
        totalAmount: 0
      };
    }

    console.log(result.length);
    return callback(null, result[0].totalAmount);
  });
};

exports.getMealBillByRecordId = function (bedMealRecordId, callback) {
  BedMealBill.find({bed_meal_record: bedMealRecordId})
    .exec(function (err, bedMealBills) {
      if (err) {
        return callback({err: systemError.database_query_error});
      }

      return callback(null, bedMealBills);
    });
};