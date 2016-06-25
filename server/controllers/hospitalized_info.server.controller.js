/**
 * Created by elinaguo on 16/6/25.
 */

'use strict';

var systemError = require('../errors/system'),
  hospitalizedInfoError = require('../errors/hospitalized_info');

var hospitalizedLogic = require('../logics/hospitalized_info'),
  bedMealBillLogic = require('../logics/bed_meal_bill');

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


exports.queryHospitalizedInfoByFilter = function (req, res, next) {
  var idNumber = req.query.id_number || '';
  var nickname = req.query.nickname || '';

  if (!idNumber && !nickname) {
    return next({err: systemError.param_null_error});
  }

  hospitalizedLogic.queryHospitalizedInfo({idNumber: idNumber, nickname: nickname}, function (err, bedMealRecords) {
    if (err) {
      return next(err);
    }

    req.data = {
      bed_meal_records: bedMealRecords
    };
    return next();
  });
};

exports.leaveHospital = function(req, res, next){
  bedMealBillLogic.getTotalAmountByHospitalizedInfoId(req.hospitalized_info._id, function(err, totalAmount){
    if(err){
      return next(err);
    }

    if(totalAmount > 0){
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