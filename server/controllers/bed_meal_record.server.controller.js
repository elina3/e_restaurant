/**
 * Created by elinaguo on 16/6/14.
 */
'use strict';
var systemError  = require('../errors/system');
var bedMealRecordLogic = require('../logics/bed_meal_record');

exports.saveBedMealRecords = function(req, res, next){
  var dateTimeStamp = req.body.meal_set_time_stamp;
  var bedMealInfos = req.body.bed_meal_infos || [];
  var time = new Date();
  if(dateTimeStamp){
    time = new Date(parseInt(dateTimeStamp));
  }

  bedMealRecordLogic.saveBedMealRecord(req.user, req.building, req.floor, bedMealInfos, time, function(err, bedMealRecords){
    if(err){
      return next(err);
    }

    req.data = {
      bed_meal_records: bedMealRecords
    };
    return next();
  });
};

exports.getBedMealRecords = function(req, res, next){
  var dateTimeStamp = req.query.meal_set_time_stamp;
  var bedId = req.query.bed_id || '';
  var mealSetDate = new Date();
  if(dateTimeStamp){
    mealSetDate = new Date(parseInt(dateTimeStamp));
  }

  bedMealRecordLogic.getBedMealRecord(mealSetDate, req.building._id, req.floor._id, bedId, function(err, bedMealRecords){
    if(err){
      return next(err);
    }

    req.data = {
      bed_meal_records: bedMealRecords
    };
    return next();
  });
};