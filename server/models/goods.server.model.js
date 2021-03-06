/**
 * Created by elinaguo on 16/2/22.
 */
'use strict';
var mealTypes = ['free_meal', 'normal'];
 mealTypes = mealTypes.concat(require('../enums/business').meal_types.all_enums);


var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  timestamps = require('mongoose-timestamp'),
  crypto = require('crypto');

var GoodsSchema = new Schema({
  object:{
    type:String,
    default:'Goods'
  },
  name: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {//工作餐，       普通，     营养餐普食，        营养餐流质饮食，  营养餐半流质饮食，     糖尿病饮食，        低脂低盐饮食
    enum: mealTypes,
    type: String,
    default: false
  },
  status: {
    enum: ['none', 'sold_out', 'on_sale'],//未开放，开放中，售罄，热卖中
    default: 'none',
    type: String
  },
  price: {
    type: Number
  },
  unit: {//单位    盒/包/袋/个
    type: String
  },
  discount: {
    type: Number
  },
  display_photos: [{
    type: String
  }],
  description_photos: [{
    type: String
  }],
  create_user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  create_group: {
    type: Schema.Types.ObjectId,
    ref: 'Group'
  },
  deleted_status: {
    type: Boolean,
    default: false
  }
});

GoodsSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

appDb.model('Goods', GoodsSchema);
