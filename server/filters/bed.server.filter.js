/**
 * Created by elinaguo on 16/6/14.
 */
'use strict';
var bedError = require('../errors/bed');
var bedLogic = require('../logics/bed');

exports.requireBuilding = function(req, res, next){
  var buildingId = req.query.building_id || req.body.building_id;

  if(!buildingId){
    return res.send({err: bedError.building_id_null});
  }

  bedLogic.getBuildingById(buildingId, function(err, building){
    if(err){
      return next(err);
    }

    if(!building){
      return next({err: bedError.building_not_exist});
    }

    req.building = building;
    next();
  });
};

exports.requireFloor = function(req, res, next){
  var floorId = req.query.floor_id || req.body.floor_id;

  if(!floorId){
    return res.send({err: bedError.floor_id_null});
  }

  bedLogic.getFloorById(floorId, function(err, floor){
    if(err){
      return next(err);
    }

    if(!floor){
      return next({err: bedError.floor_not_exist});
    }

    req.floor = floor;
    next();
  });
};

exports.requireBed = function(req, res, next){
  var bedId = req.query.bed_id || req.body.bed_id;

  if(!bedId){
    return res.send({err: bedError.bed_id_null});
  }

  bedLogic.getBedById(bedId, function(err, bed){
    if(err){
      return next(err);
    }

    if(!bed){
      return next({err: bedError.bed_not_exist});
    }

    req.bed = bed;
    next();
  });
};