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
//只有餐厅的有Payment，超市的不在这里
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
  amount: {//实收
    type: Number
  },
  total_amount: {//应收
    type: Number
  },
  has_discount: {
    type: Number
  },
  card: {
    type: Schema.Types.ObjectId,
    ref: 'Card'
  },
  card_number: {
    type: String
  },
  card_id_number: {//饭卡的证件号（工号／身份证号等），主要用语查询
    type: String
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
  pay_time: {
    type: Date
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


PaymentSchema.pre('save', function (next) {
  this.has_discount = false;
  if(this.paid && this.total_amount !== this.amount){
    this.has_discount = true;
  }
  next();
});

appDb.model('Payment', PaymentSchema);
