/**
 * Created by elinaguo on 16/6/25.
 */
'use strict';
var hospitalizedInfoError = require('../errors/hospitalized_info');
var hospitalizedInfoLogic = require('../logics/hospitalized_info');

exports.requireHospitalizedInfo = function(req, res, next){
  var hospitalizedInfoId = req.query.hospitalized_info_id || req.body.hospitalized_info_id;

  if(!hospitalizedInfoId){
    return res.send({err: hospitalizedInfoError.hospitalized_info_id_null});
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
