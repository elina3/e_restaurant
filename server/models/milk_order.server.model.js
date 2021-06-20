'use strict';

var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  timestamps = require('mongoose-timestamp'),
  crypto = require('crypto');

var MilkOrderSchema = new Schema({
  object:{
    type:String,
    default:'MilkOrder'
  },
  order_number: {
    type: String
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client'
  },
  client_info: {
    type: Schema.Types.Mixed
  },
  card: {
    type: Schema.Types.ObjectId,
    ref: 'Card',
    index: true
  },
  card_number: {
    type: String,
    index: true
  },
  card_id_number: {
    type: String,
    index: true
  },
  amount: {//应收金额(分)
    type: Number
  },
  actual_amount: {//实收总金额(分)
    type: Number
  },
  has_discount: {
    type: Boolean
  },
  description: {
    type: String,
    default: ''
  },
  paid: {
    type: Boolean,
    default: false
  },
  pay_time: {
    type: Date,
    index: true
  },
  deleted_status: {
    type: Boolean,
    default: false
  }
});

MilkOrderSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

MilkOrderSchema.pre('save', function (next) {
  this.has_discount = false;
  if(this.actual_amount !== this.amount){
    this.has_discount = true;
  }
  next();
});

appDb.model('MilkOrder', MilkOrderSchema);

