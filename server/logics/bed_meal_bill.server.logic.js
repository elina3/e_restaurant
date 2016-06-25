/**
 * Created by elinaguo on 16/6/25.
 */
'use strict';
var async = require('async');
var mongooseLib = require('../libraries/mongoose');
var appDb = mongooseLib.appDb;
var GoodsBill = appDb.model('GoodsBill'),
 BedMealBill = appDb.model('BedMealBill');

var systemError = require('../errors/system'),
  bedMeallBillError = require('../errors/bed_meal_bill');

var mealTags = ['breakfast', 'lunch', 'dinner'];

function upsertBedMealBillForMealTag(user, bedMealRecord, mealTag, goodsBills, callback){
  var query = {
    bed_meal_record: bedMealRecord._id,
    meal_tag: mealTag,
    deleted_status: false
  };
  BedMealBill.findOne(query)
    .exec(function(err, bedMealBill){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      //不存在账单，没有选择不做任何事情
      if(!bedMealBill && !bedMealRecord[mealTag]){
        return callback();
      }

      if(bedMealBill && bedMealBill.is_checkout){
        return callback(null, bedMealBill);
      }

      var userInfo = {
        username: user.username,
        nickname: user.nickname
      };
      if(!bedMealBill){
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
          creator: user._id,
          creator_info: userInfo
        });
      }

      bedMealBill.recent_modify_user = user._id;
      bedMealBill.recent_modify_user_info = userInfo;


      if(goodsBills){//goodsBills为空,表示统一下单的普食，不更新goods_bills
        bedMealBill.goods_bills = goodsBills;
        bedMealBill.meal_type = bedMealRecord[mealTag];
      }

      bedMealBill.save(function(err, newBedMealBill){
        if(err || !newBedMealBill){
          return callback({err: systemError.database_save_error});
        }

        return callback(null, newBedMealBill);
      });
    });
}

function batchCreateBillsByBedMealRecord(user, bedMealRecord, healthyMeals, callback){
  async.each(mealTags, function(mealTag, eachCallback){
    var goodsBills = [];
    if(!bedMealRecord[mealTag] || bedMealRecord[mealTag] === 'healthy_normal'){//没有选或选择普食
      return eachCallback();
    }

    var healthyGoodsInfo = healthyMeals[bedMealRecord[mealTag]];
    if(!healthyGoodsInfo){
      return eachCallback({err: bedMeallBillError.healthy_goods_not_all_exist});
    }

    if(healthyMeals[bedMealRecord[mealTag]]){//选了，但是不是选择普食
      goodsBills = getGoodsBills([healthyGoodsInfo]);
    }

    upsertBedMealBillForMealTag(user, bedMealRecord, mealTag, goodsBills, function(err, bedMealBill){
      return eachCallback(err);
    });
  }, function(err){
    return callback(err);
  });
}

//护士为病人设置营养餐时生成账单
exports.batchCreateMealBills = function(user, bedMealRecords, healthyMeals, callback){
  async.each(bedMealRecords, function(bedMealRecord, eachCallback){
    batchCreateBillsByBedMealRecord(bedMealRecord, function(err){
      return eachCallback(err);
    });
  }, function(err){
    return callback(err);
  });
};

function getGoodsBills(goodsInfos){
  if(!Array.isArray(goodsInfos)){
    return callback({err: bedMeallBillError.invalid_goods_infos})
  }
  return goodsInfos.map(function(goodsInfo){
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
}
//食堂工作人员为某床病人选餐
exports.chooseGoodsBillForBedMealRecord = function(user, bedMealRecord, mealTag, goodsInfos, callback){
  var goodsBills = getGoodsBills(goodsInfos);
  if(goodsBills.length === 0){
    return callback({err: bedMeallBillError.no_goods_info});
  }

  upsertBedMealBillForMealTag(user, bedMealRecord, mealTag, goodsBills, function(err, bedMealBill){
    if(err){
      return callback(err);
    }

    return callback(null, bedMealBill);
  });
};

//清算
exports.checkoutByHospitalizedInfoId = function(user, hospitalizedInfoId, callback){
  var query = {
    deleted_status: false,
    is_checkout: false,
    hospitalized_info: hospitalizedInfoId
  };

  BedMealBill.find(query)
    .exec(function(err, bedMealBills){
      if(err || !bedMealBills){
        return callback({err: systemError.database_query_error});
      }

      var amountDue = 0;
      var amountPaid = 0;
      var checkoutCount = 0;
      async.each(bedMealBills, function(bedMealBill, eachCallback){
        bedMealBill.is_checkout = true;
        bedMealBill.checkout_creator = user._id;
        bedMealBill.checkout_creator_info = {
          username: user.username,
          nickname: user.nickname
        };
        bedMealBill.save(function(err, savedBedMealBill){
          if(err || !savedBedMealBill){
            return eachCallback({err: systemError.database_save_error});
          }

          amountDue += savedBedMealBill.amount_due;
          amountPaid += savedBedMealBill.amount_paid;
          checkoutCount++;

          return eachCallback();
        });
      }, function(err){
        //错误不处理，返回已结清的数据

        return callback(null, {
          amountDue: amountDue,
          amountPaid: amountPaid,
          checkoutCount: checkoutCount
        });
      });
    });
};

//获取未结算总金额
exports.getTotalAmountByHospitalizedInfoId = function(hospitalizedInfoId, callback){
  var match = {
    deleted_status: false,
    is_checkout: false,
    hospitalized_info: hospitalizedInfoId
  };

  BedMealBill.aggregate([{
    $match: match
  }, {
    $group: {
      _id: '$hospitalized_info',
      bed_meal_bills: {$push: '$$ROOT'},
      total_amount: {$sum: '$amount_paid'}
    }
  }], function(err, result){
    if(err || !result){
      return callback({err: systemError.database_query_error});
    }

    if(result.length === 0){
      return callback(null, 0);
    }

    return callback(null, result[0]);
  });
};

//根据条件获取账单
exports.getMealBillByFilter =function(hospitalizedInfo, status, pagination, callback){
  var query = {
    deleted_status: false
  };

  if(status === 'un_paid'){
    query.is_checkout = false;
  }else if(status === 'paid'){
    query.is_checkout = true;
  }

  BedMealBill.count(query, function(err, totalCount){
    if(err){
      return callback({err: systemError.database_query_error});
    }

    if (pagination.limit === -1) {
      pagination.limit = totalCount;
    }

    if (pagination.skipCount === -1) {
      pagination.skipCount = pagination.limit * (pagination.currentPage - 1);
    }

    BedMealBill.find(query)
      .sort({update_time: -1})
      .skip(pagination.skipCount)
      .limit(pagination.limit)
      .exec(function(err, bedMealBills){
        if(err || bedMealBills){
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

exports.getMealBillByRecordId = function(bedMealRecordId, callback){
  BedMealBill.findOne({bed_meal_record: bedMealRecordId})
    .exec(function(err, bedMealBill){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      return callback(null, bedMealBill);
    });
};