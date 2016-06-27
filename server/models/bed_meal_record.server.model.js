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
  hospitalized_info: {//入住信息
    type: Schema.Types.ObjectId,
    ref: 'HospitalizedInfo'
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
  breakfast: {      //'healthy_normal', 'liquid_diets', 'semi_liquid_diets', 'diabetic_diets', 'low_fat_low_salt_diets'
    type: String    //'lunch_liquid_diets','lunch_semi_liquid_diets','lunch_diabetic_diets','lunch_low_fat_low_salt_diets',
                    //'dinner_liquid_diets', 'dinner_semi_liquid_diets', 'dinner_diabetic_diets', 'dinner_low_fat_low_salt_diets'
  },
  lunch: {
    type: String
  },
  dinner: {
    type: String
  },
  create_user: {
    type: Schema.Types.ObjectId
  },
  deleted_status: {
    type: Boolean,
    default: false
  }
});

BedMealRecordSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});


appDb.model('BedMealRecord', BedMealRecordSchema);