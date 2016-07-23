/**
 * Created by elinaguo on 16/7/4.
 */
'use strict';


var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  timestamps = require('mongoose-timestamp'),
  crypto = require('crypto');

var PackageMealInfoSchema = new Schema({
  object:{
    type:String,
    default:'PackageMealInfo'
  },
  name: {
    type: String,
    trim: true
  },
  price: {
    type: Number//分
  },
  display_photo: {
    type: String
  }
});
appDb.model('PackageMealInfo', PackageMealInfoSchema);

var MealTypeSchema = new Schema({
  object:{
    type:String,
    default:'MealType'
  },
  name: {
    type: String
  },
  breakfast_price: {
    type: Number//分
  },
  lunch_price: {
    type: Number//分
  },
  dinner_price: {
    type: Number//分
  },
  need_choose_package_meal: {
    type: Boolean,
    default: false
  },
  package_meals: [{
    type: Schema.Types.Mixed
  }],
  deleted_status: {
    type: Boolean,
    default: false
  },
  creator_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  creator_info: {
    type: Schema.Types.Mixed
  },
  modify_user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  modify_user_info: {
    type: Schema.Types.Mixed
  }
});
MealTypeSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});
appDb.model('MealType', MealTypeSchema);