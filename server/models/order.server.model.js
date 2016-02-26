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

var OrderSchema = new Schema({
  object:{
    type:String,
    default:'Order'
  },
  order_number: {
    type: String
  },
  status: {
    enum: ['unpaid', 'paid', 'cooking', 'transporting', 'complete'],
    default: 'unpaid',
    type: String
  },
  goods_orders: [{
    type: Schema.Types.ObjectId,
    ref: 'GoodsOrder'
  }],
  contact: {
    type: Schema.Types.ObjectId,
    ref: 'Contact'
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

OrderSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

appDb.model('Order', OrderSchema);
