/**
 * Created by elinaguo on 16/6/25.
 */

'use strict';

var systemError = require('../errors/system'),
  hospitalizedInfoError = require('../errors/hospitalized_info');

var hospitalizedLogic = require('../logics/hospitalized_info'),
  bedMealBillLogic = require('../logics/bed_meal_bill'),
  bedMealRecordLogic = require('../logics/v2_bed_meal_record');

exports.addNewHospitalizedInfo = function (req, res, next) {
  var sickerInfo = req.body.sicker_info;
  hospitalizedLogic.createNewHospitalizedInfo(req.user, req.building, req.floor, req.bed, sickerInfo, function (err, hospitalizedInfo) {
    if (err) {
      return next(err);
    }

    req.data = {
      success: true
    };
    return next();
  });
};


exports.queryHospitalizedInfoByIdNumber = function (req, res, next) {
  hospitalizedLogic.queryHospitalizedInfoByIdNumber({idNumber: req.query.id_number || ''}, function (err, hospitalizedInfos) {
    if (err) {
      return next(err);
    }

    req.data = {
      hospitalized_infos: hospitalizedInfos
    };
    return next();
  });
};


exports.queryHospitalizedInfoByFilter = function (req, res, next) {
  hospitalizedLogic.queryHospitalizedInfoByFilter(req.building, req.floor, function (err, hospitalizedInfos) {
    if (err) {
      return next(err);
    }

    req.data = {
      hospitalized_infos: hospitalizedInfos
    };
    return next();
  });
};

exports.leaveHospital = function(req, res, next){
  bedMealBillLogic.getTotalAmountByHospitalizedInfoId(req.hospitalized_info._id, function(err, result){
    if(err){
      return next(err);
    }

    if(result.total_amount > 0){
      return next({err: hospitalizedInfoError.bill_not_checkout});
    }

    bedMealBillLogic.cancelPrepareBill(req.user, req.hospitalized_info, function(err){
      if(err){
        return next(err);
      }

      hospitalizedLogic.leaveHospital(req.user, req.hospitalized_info, req.body.description, function(err, hospitalizedInfo){
        if(err){
          return next(err);
        }

        req.data = {
          success: true
        };
        return next();
      });
    });
  });
};

exports.addLeaveDescription = function(req, res, next){
  var description = req.body.description;
  if(!description){
    return next({err: systemError.param_null_error});
  }

  hospitalizedLogic.addLeaveDescription(req.user, req.hospitalized_info, description, function(err, newHospitalizedInfo){
    if(err){
      return next(err);
    }

    req.data = {
      success: true
    };
    return next();
  });
};


exports.leaveHospitalV2 = function(req, res, next){
  bedMealRecordLogic.getTotalAmountByHospitalizedInfoId(req.hospitalized_info._id, function(err, totalAmoumnt){
    if(err){
      return next(err);
    }

    if(totalAmoumnt > 0){
      return next({err: hospitalizedInfoError.bill_not_checkout});
    }

    hospitalizedLogic.leaveHospital(req.user, req.hospitalized_info, req.body.description, function(err, hospitalizedInfo){
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