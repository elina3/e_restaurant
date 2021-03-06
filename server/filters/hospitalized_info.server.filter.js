/**
 * Created by elinaguo on 16/6/25.
 */
'use strict';
var hospitalizedInfoError = require('../errors/hospitalized_info');
var hospitalizedInfoLogic = require('../logics/hospitalized_info');
var mongoLib = require('../libraries/mongoose');

exports.validCanHospitalizedBed = function(req, res, next){
  hospitalizedInfoLogic.getHospitalizedInfoByBed(req.building, req.floor, req.bed, function(err, hospitalizedInfo){
    if(err){
      return next(err);
    }

    if(hospitalizedInfo){
      return next({err: hospitalizedInfoError.bed_is_hospitalized});
    }

    next();
  });
};

exports.requireHospitalizedInfo = function(req, res, next){
  var hospitalizedInfoId = req.query.hospitalized_info_id || req.body.hospitalized_info_id;

  if(!hospitalizedInfoId){
    return next({err: hospitalizedInfoError.hospitalized_info_id_null});
  }

  hospitalizedInfoLogic.getHospitalizedInfoById(hospitalizedInfoId, null, function(err, hospitalizedInfo){
    if(err){
      return next(err);
    }

    if(!hospitalizedInfo){
      return next({err: hospitalizedInfoError.hospitalized_info_not_exist});
    }

    req.hospitalized_info = hospitalizedInfo;
    next();
  });
};


exports.requireDistHospitalizedInfoByBed = function(req, res, next){
  var bedId = req.query.bed_id || req.body.bed_id;

  if(!mongoLib.isObjectId(bedId)){
    return next({err: hospitalizedInfoError.invalid_bed_id});
  }

  hospitalizedInfoLogic.getHospitalizedInfoByBedId(bedId, function(err, hospitalizedInfo){
    if(err){
      return next(err);
    }

    if(!hospitalizedInfo){
      return next({err: hospitalizedInfoError.hospitalized_info_not_exist});
    }

    req.dist_hospitalized_info = hospitalizedInfo;
    next();
  });
};

exports.requireHospitalizedInfoWithPopulation = function(req, res, next){
  var hospitalizedInfoId = req.query.hospitalized_info_id || req.body.hospitalized_info_id;

  if(!hospitalizedInfoId){
    return res.send({err: hospitalizedInfoError.hospitalized_info_id_null});
  }

  hospitalizedInfoLogic.getHospitalizedInfoById(hospitalizedInfoId, 'building floor bed', function(err, hospitalizedInfo){
    if(err){
      return next(err);
    }

    if(!hospitalizedInfo){
      return next({err: hospitalizedInfoError.hospitalized_info_not_exist});
    }

    req.hospitalized_info = hospitalizedInfo;
    next();
  });
};
