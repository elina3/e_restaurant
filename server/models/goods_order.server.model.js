/**
 * Created by elinaguo on 16/2/23.
 */
'use strict';

var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  timestamps = require('mongoose-timestamp'),
  crypto = require('crypto');

var GoodsOrderSchema = new Schema({
  object:{
    type:String,
    default:'GoodsOrder'
  },
  order: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  goods: {
    type: Schema.Types.ObjectId,
    ref: 'Goods'
  },
  status: {
    type: String,
    enum: ['prepare', 'cooking', 'complete'],
    default: 'prepare'
  },
  price: {
    type: Number
  },
  count: {
    type: Number
  },
  total_price: {
    type: Number
  },
  description: {
    type: String,
    default: ''
  },
  deleted_status: {
    type: Boolean,
    default: false
  }
});

GoodsOrderSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});


GoodsOrderSchema.pre('save', function (next) {
  this.total_price = this.price * this.count;
  next();
});

appDb.model('GoodsOrder', GoodsOrderSchema);
