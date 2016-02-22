/**
 * Created by elinaguo on 16/2/22.
 */
'use strict';

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
  status: {
    enum: ['none', 'paid', 'cooking', 'transporting', 'complete'],
    default: 'none',
    type: String
  },
  sex: {
    type: String,
    enum: ['male', 'female', 'unknown'],
    default: 'unknown'
  },
  city: {
    type: String
  },
  province: {
    type: String
  },
  country: {
    type: String
  },
  mobile_phone: {
    type: String
  },
  union_id: {
    type: String
  },
  head_photo: {
    type: String
  },
  salt: {
    type: String,
    default: 'secret'
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
