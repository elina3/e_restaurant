/**
 * Created by elinaguo on 16/6/25.
 */

'use strict';

var systemError = require('../errors/system'),
  bedMealBillError = require('../errors/bed_meal_bill');

var bedMealBillLogic = require('../logics/bed_meal_bill'),
  goodsLogic = require('../logics/goods');

//护士下单（今日账单）
exports.batchCreateBills = function (req, res, next) {

  bedMealBillLogic.batchCreateMealBills(req.user, req.bed_meal_records, req.healthy_meal_dic, function (err, hospitalizedInfo) {
    if (err) {
      return next(err);
    }

    req.data = {
      success: true
    };
    return next();
  });
};

function getGoodsInfos(goodsInfos, callback) {
  if(!Array.isArray(goodsInfos) || !goodsInfos || goodsInfos.length === 0){
    return callback({err: bedMealBillError.invalid_goods_infos});
  }

  var goodsIds = goodsInfos.map(function (goods) {
    return goods.goods_id;
  });

  goodsLogic.getGoodsInfos(goodsIds, function (err, goodsList) {
    if (err) {
      return callback(err);
    }

    var goodsDic = {};
    goodsList.forEach(function(item){
      goodsDic[item._id.toString()] = item;
    });

    var result = [];
    goodsInfos.forEach(function (goodsInfo) {
      var goods = goodsDic[goodsInfo.goods_id];
      if(goods){
        result.push({
          goods_id :goods._id,
          count :goodsInfo.count,
          name :goods.name,
          description :goods.description,
          display_photos :goods.display,
          status: goods.status,
          price :goods.price * 100
        });
      }
    });

    if (goodsIds.length !== result.length) {
      return callback({err: bedMealBillError.goods_not_all_exist});
    }

    return callback(null, result);
  });
}

exports.chooseGoodsBill = function (req, res, next) {
  getGoodsInfos(req.body.goods_infos || [], function(err, goodsInfos){
    if(err){
      return next(err);
    }

    bedMealBillLogic.chooseGoodsBillForBedMealRecord(req.client, req.bed_meal_record, req.body.meal_tag, goodsInfos, function(err, newBedMealBill){
      if(err){
        return next(err);
      }

      req.data = {
        success: true
      };
      return next();
    });
  });

};

exports.queryBedMealBillsByFilter = function (req, res, next) {
  var timeRange = JSON.parse(req.query.time_range) || {};
  var defaultStart = new Date('1970-1-1 00:00:00');
  var startTime = !timeRange.startTime ? defaultStart : (new Date(timeRange.startTime) || defaultStart);
  var endTime = !timeRange.endTime ? new Date() : (new Date(timeRange.endTime) || new Date());

  bedMealBillLogic.getMealBillByFilter({
    status: req.query.status || '',
    mealTag: req.query.meal_tag || '',
    mealType: req.query.meal_type || '',
    idNumber: req.query.id_number || '',
    startTime: startTime,
    endTime: endTime
  }, req.pagination, function(err, result){
    if(err){
      return next(err);
    }

    req.data = {
      total_count: result.totalCount,
      limit: result.limit,
      bed_meal_bills: result.bedMealBills
    };
    return next();
  });
};

exports.getBedMealBillStatistic = function(req, res, next){
  var timeRange = JSON.parse(req.query.time_range) || {};
  var defaultStart = new Date('1970-1-1 00:00:00');
  var startTime = !timeRange.startTime ? defaultStart : (new Date(timeRange.startTime) || defaultStart);
  var endTime = !timeRange.endTime ? new Date() : (new Date(timeRange.endTime) || new Date());

  bedMealBillLogic.getBedMealBillTotalAmount({
    mealType: req.query.meal_type || '',
    mealTag: req.query.meal_tag || '',
    idNumber: req.query.id_number || '',
    status: req.query.status || '',
    startTime: startTime,
    endTime: endTime
  }, function(err, totalAmount){
    if(err){
      return next(err);
    }

    req.data = {
      totalAmount: totalAmount
    };
    return next();
  });
};

exports.querySickerBedMealBillsByFilter = function (req, res, next) {
  bedMealBillLogic.getMealBillByFilter({
    status: req.query.status,
    hospitalizedInfo: req.hospitalized_info
  }, req.pagination, function(err, result){
    if(err){
      return next(err);
    }

    req.data = {
      total_count: result.totalCount,
      limit: result.limit,
      bed_meal_bills: result.bedMealBills
    };
    return next();

  });
};

exports.checkoutByHospitalizedInfoId = function (req, res, next) {
  if(req.hospitalized_info.is_leave_hospital){
    return next({err: bedMealBillError.is_leave_hospital});
  }

  bedMealBillLogic.checkoutByHospitalizedInfoId(req.user, req.hospitalized_info, function(err, result){
    if(err){
      return next(err);
    }

    req.data = {
      amount_due: result.amountDue,
      amount_paid: result.amountPaid,
      checkout_count: result.checkoutCount,
      bed_meal_bills: result.bedMealBills,
      bedMealBillCheckout: result.bedMealBillCheckout
    };
    return next();
  });
};