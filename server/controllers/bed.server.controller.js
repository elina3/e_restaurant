/**
 * Created by elinaguo on 16/6/12.
 */
'use strict';
var systemError  = require('../errors/system');
var bedLogic = require('../logics/bed');
var publicLib = require('../libraries/public');

exports.getBuildings = function(req, res, next){
  var user = req.user;
  bedLogic.getBuildingsByHospitalId(user.hospital, function(err, buildings){
    if(err){
      return next(err);
    }

    req.data = {
      buildings: buildings
    };
    return next();
  });
};

exports.getFloorsByBuildingId = function(req, res, next){
  var buildingId = req.query.building_id || '';
  bedLogic.getFloorsByBuildingId(buildingId, function(err, floors){
    if(err){
      return next(err);
    }

    req.data = {
      floors: floors
    };
    return next();
  });
};


exports.getBedsByFloorId = function(req, res, next){
  var floorId = req.query.floor_id || '';
  bedLogic.getBedsByFloorId(floorId, function(err, beds){
    if(err){
      return next(err);
    }

    req.data = {
      beds: beds
    };
    return next();
  });
};