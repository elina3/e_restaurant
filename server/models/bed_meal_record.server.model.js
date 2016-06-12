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
  time: {
    type: Date
  },
  meal_type: {//'liquid_diets', 'normal', 'soft_diets', 'semi_liquid_diets'
    type: String
  },
  bed_id: {
    type: Schema.Types.ObjectId,
    ref: 'Bed'
  },
  bed_name: {//证件id
    type: String
  },
  bed_description: {
    type: String
  },
  floor_id: {
    type: Schema.Types.ObjectId,
    ref: 'Floor'
  },
  floor_name: {
    type: String
  },
  floor_description: {
    type: String
  },
  building_id: {
    type: Schema.Types.ObjectId,
    ref: 'Building'
  },
  building_name: {
    type: String
  },
  building_address: {
    type: String
  },
  building_description: {
    type: String
  }
});

BedMealRecordSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});


appDb.model('BedMealRecord', BedMealRecordSchema);