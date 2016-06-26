/**
 * Created by elinaguo on 16/6/25.
 */
'use strict';
var bedMealRecordError = require('../errors/bed_meal_record');
var bedMealRecordLogic = require('../logics/bed_meal_record');

exports.requireMealRecords = function(req, res, next){
  var bedMealRecordIds = req.query.bed_meal_record_ids  || req.body.bed_meal_record_ids || [];
  var population = req.query.population || req.body.population || 'hospitalized_info';
  if(!Array.isArray(bedMealRecordIds)){
    return next({err: bedMealRecordError.invalid_bed_meal_record_ids});
  }

  bedMealRecordLogic.getBedMealRecordsByIds(bedMealRecordIds, population, function(err, bedMealRecords){
    if(err){
      return next(err);
    }

    req.bed_meal_records = bedMealRecords;
    next();
  });
};

exports.requireMealRecord = function(req, res, next){
  var bedMealRecordId = req.query.bed_meal_record_id  || req.body.bed_meal_record_id;
  var population = req.query.population || req.body.population || 'hospitalized_info';
  if(!bedMealRecordId){
    return next({err: bedMealRecordError.invalid_bed_meal_record_id});
  }

  bedMealRecordLogic.getBedMealRecordsById(bedMealRecordId, population, function(err, bedMealRecord){
    if(err){
      return next(err);
    }

    if(!bedMealRecord){
      return next({err: bedMealRecordError.bed_meal_record_not_exist});
    }
    req.bed_meal_record = bedMealRecord;
    next();
  });
};