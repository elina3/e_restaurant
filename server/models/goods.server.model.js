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
    enum: ['none', 'sold_out', 'on_sale'],
    default: 'none',
    type: String
  },
  price: {
    type: Number
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
