/**
 * Created by elinaguo on 16/6/13.
 */
'use strict';

var async = require('async');
var mongooseLib = require('../libraries/mongoose');
var appDb = mongooseLib.appDb;
var BedMealRecord = appDb.model('BedMealRecord');

var systemError = require('../errors/system'),
  bedMealRecordError = require('../errors/bed_meal_record');

function parseToDate(time){
  if(!time){
    time = new Date();
  }
  return new Date(time.toDateString());
}

exports.saveBedMealRecord = function(user, building, floor, bedMealInfos, date, callback){
  var today = parseToDate(new Date());
  var date = parseToDate(date);
  if(date < today){
    return callback({err: bedMealRecordError.time_out});
  }

  var bedMealRecords = [];
  async.each(bedMealInfos, function(bedMealInfo, eachCallback){
    BedMealRecord.findOne({meal_set_date: date, floor: floor._id, building: building._id, bed: bedMealInfo._id})
      .exec(function(err, bedMealRecord){
        if(err){
          return eachCallback({err: systemError.database_query_error});
        }

        if(!bedMealRecord){
          bedMealRecord = new BedMealRecord({
            meal_set_date: date,
            building: building._id,
            floor: floor._id,
            bed: bedMealInfo._id
          });
        }

        bedMealRecord.breakfast = bedMealInfo.breakfast;
        bedMealRecord.lunch = bedMealInfo.lunch;
        bedMealRecord.dinner = bedMealInfo.dinner;
        bedMealRecord.create_user = user;
        bedMealRecord.save(function(err, newBedMealRecord){
          if(err || !newBedMealRecord){
            return eachCallback({err: systemError.database_save_error});
          }

          bedMealRecords.push(newBedMealRecord);
          return eachCallback(null, newBedMealRecord);
        });
      });
  }, function(err){
    return callback(err, bedMealRecords);
  });
};

exports.getBedMealRecord = function(mealSetDate, buildingId, floorId, bedId, callback){
  mealSetDate = parseToDate(mealSetDate);//如果为空则为今天的日期
  var query = {meal_set_date: mealSetDate,
    building: buildingId,
    floor: floorId
  };

  if(bedId){
    query.bed = bedId;
  }
  BedMealRecord.find(query)
    .exec(function(err, bedMealRecords){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      return callback(null, bedMealRecords);
    });
};