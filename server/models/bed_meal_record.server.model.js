/**
 * Created by elinaguo on 16/6/13.
 */
'use strict';

var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  timestamps = require('mongoose-timestamp');

var BedMealRecordSchema = new Schema({
  object:{
    type:String,
    default:'BedMealRecord'
  },
  meal_set_date: {//日期
    type: Date
  },
  building: {
    type: Schema.Types.ObjectId,
    ref: 'Building'
  },
  floor: {
    type: Schema.Types.ObjectId,
    ref: 'Floor'
  },
  bed: {
    type: Schema.Types.ObjectId,
    ref: 'Bed'
  },
  breakfast: {//'liquid_diets', 'normal', 'soft_diets', 'semi_liquid_diets'
    type: String
  },
  lunch: {
    type: String
  },
  dinner: {
    type: String
  },
  create_user: {
    type: Schema.Types.ObjectId
  }
});

BedMealRecordSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});


appDb.model('BedMealRecord', BedMealRecordSchema);