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
          price :goods.price * 100
        });
      }
    });

    if (goodsIds.length === result.length) {
      return callback({err: bedMealBillError.goods_not_all_exist});
    }

    return callback(null, result);
  });
}

exports.chooseGoodsBill = function (req, res, next) {
  getGoodsInfos(req.query.goods_infos || [], function(err, goodsInfos){
    if(err){
      return next(err);
    }

    bedMealBillLogic.chooseGoodsBillForBedMealRecord(req.user, req.bed_meal_record, req.body.meal_tag, goodsInfos, function(err, newBedMealBill){
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
  var status = req.query.status || 'un_paid';
  bedMealBillLogic.getMealBillByFilter(status, req.hospitalized_info, req.pagination, function(err, result){
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
  bedMealBillLogic.checkoutByHospitalizedInfoId(req.user, req.hospitalized_info, function(err, result){
    if(err){
      return next(err);
    }

    req.data = {
      amount_due: result.amountDue,
      amount_paid: result.amountPaid,
      checkout_count: result.checkoutCount
    };
    return next();
  });
};