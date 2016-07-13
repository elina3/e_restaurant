/**
 * Created by elinaguo on 16/7/4.
 */
'use strict';
var bedMealRecordError = require('../errors/v2_bed_meal_record');
var bedMealRecordLogic = require('../logics/v2_bed_meal_record');


exports.requireBedMealRecord = function(req, res, next){
  var bedMealRecordId = req.query.bed_meal_record_id  || req.body.bed_meal_record_id;
  if(!bedMealRecordId){
    return next({err: bedMealRecordError.invalid_bed_meal_record_id});
  }

  bedMealRecordLogic.getBedMealRecordsById(bedMealRecordId, function(err, bedMealRecord){
    if(err){
      return next(err);
    }

    if(!bedMealRecord){
      return next({err: bedMealRecordError.bed_meal_record_not_exist});
    }

    if(bedMealRecord.deleted_status){
      return next({err: bedMealRecordError.bed_meal_record_deleted});
    }

    req.bed_meal_record = bedMealRecord;
    next();
  });
};