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

var PaymentSchema = new Schema({
  object:{
    type:String,
    default:'Payment'
  },
  order: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  method: {
    enum: ['wechat', 'card'],
    type: 'String'
  },
  client: {//客户端用户产生的订单
    type: Schema.Types.ObjectId,
    ref: 'Client'
  },
  group_name: {
    type: 'String'
  },
  partner_trade_no: {
    type: String
  },
  amount: {
    type: Number
  },
  spbill_create_ip: {
    type: String
  },
  description: {
    type: String
  },
  paid: {
    type: Boolean,
    default: false
  },
  deleted_status: {
    type: Boolean,
    default: false
  }
});

PaymentSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

appDb.model('Payment', PaymentSchema);
