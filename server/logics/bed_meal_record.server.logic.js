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

function translateTime(createTime){
  var hour = createTime.getHours();
  if(hour >= 0 && hour < 10){
    return 'breakfast';
  }
  else if(hour >= 10 && hour < 16){
    return 'lunch';
  }else{
    return 'dinner';
  }
}

exports.updateBedMealRecordSetting = function(date, bedMealRecord, breakfast, lunch, dinner, callback){
  var now = new Date();
  var today = parseToDate(now);
  var mealSetDate = bedMealRecord.meal_set_date;
  if(mealSetDate < today){
    return callback({err: bedMealRecordError.time_out});
  }
  var isToday = mealSetDate === today;

  var currentMealType = translateTime(now);

  if(isToday){
    if(currentMealType === 'dinner'){
      bedMealRecord.dinner = dinner;
    }else if(currentMealType === 'lunch'){
      bedMealRecord.lunch = lunch;
    }else{
      bedMealRecord.breakfast = breakfast;
    }
  }else{
    bedMealRecord.breakfast = breakfast;
    bedMealRecord.lunch = lunch;
    bedMealRecord.dinner = dinner;
  }

  bedMealRecord.save(function(err, newBedMealRecord){
    if(err || !newBedMealRecord){
      return callback({err: systemError.database_save_error});
    }

    return callback(null, newBedMealRecord);
  });
};

exports.createAndGetBedMealRecord = function(user, mealSetDate, hospitalizedInfo, buildingId, floorId, bedId, callback){
  mealSetDate = parseToDate(mealSetDate);//如果为空则为今天的日期
  var query = {
    meal_set_date: mealSetDate,
    hospitalized_info: hospitalizedInfo._id,
    building: buildingId,
    floor: floorId,
    bed: bedId,
    deleted_status: false
  };
  BedMealRecord.findOne(query)
    .exec(function(err, bedMealRecord){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      if(bedMealRecord){
        return callback(null, bedMealRecord);
      }

      bedMealRecord = new BedMealRecord({
        meal_set_date: mealSetDate,
        hospitalized_info: hospitalizedInfo._id,
        building: buildingId,
        floor: floorId,
        bed: bedId,
        deleted_status: false,
        create_user: user._id
      });
      bedMealRecord.save(function(err, newBedMealRecord){
        if(err || !newBedMealRecord){
          return callback({err: systemError.database_save_error})
        }

        return callback(null, newBedMealRecord);
      });
    });
};

exports.getBedMealRecord = function(mealSetDate, buildingId, floorId, bedId, callback){
  mealSetDate = parseToDate(mealSetDate);//如果为空则为今天的日期
  var query = {
    meal_set_date: mealSetDate,
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

exports.getBedMealRecordsByIds = function(ids, population, callback){
  if(!population){
    population = ''
  }
  BedMealRecord.find({_id: {$in: ids}})
    .populate(population)
    .exec(function(err, bedMealRecords){
      if(err || !bedMealRecords){
        return callback({err: systemError.database_query_error});
      }

      return callback(null, bedMealRecords);
    });
};

exports.getHealthyNormalMealRecordByBedGroup = function(building, floor, mealTag, callback){
  var todayMealTimeSet =parseToDate(new Date());
  if(!mealTag){
    return callback({err: bedMealRecordError.meal_tag_param_null});
  }
  var query = {
    meal_set_date: todayMealTimeSet,
    building: building._id,
    floor: floor._id,
    deleted_status: false
  };
  query[mealTag] = 'healthy_normal';
  BedMealRecord.find(query)
    .populate('bed hospitalized_info')
    .exec(function(err, bedMealRecords){
      if(err || !bedMealRecords){
        return callback({err: systemError.database_query_error});
      }

      return callback(null, bedMealRecords);
    });
};