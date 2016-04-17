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

var CardSchema = new Schema({
  object:{
    type:String,
    default:'Card'
  },
  card_number: {
    type: String,
    trim: true
  },
  status: {
    enum: ['enabled', 'disabled'],
    default: 'disabled',
    type: String
  },
  registration_number: {//省份证id
    type: String
  },
  money: {
    type: Number,//money unit: yuan
    default:0
  },
  deleted_status: {
    type: Boolean,
    default: false
  }
});

CardSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

appDb.model('Card', CardSchema);
