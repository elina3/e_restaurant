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
  goods_id: {
    type: Schema.Types.ObjectId
  },
  name: {
    type: String
  },
  description: {
    type: String
  },
  display_photos: [{
    type: String
  }],
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
  }
});
appDb.model('GoodsOrder', GoodsOrderSchema);

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
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group'
  },
  group_name: {
    enum: ['餐厅', '超市'],
    type: String
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client'
  },
  client_info: {
    type: Schema.Types.Mixed
  },
  goods_orders: [{
    type: Schema.Types.Mixed
  }],
  contact: {
    type: Schema.Types.Mixed
  },
  in_store_deal: {//是否在店交易
    type: Boolean,
    default: false
  },
  total_price: {//应收总金额
    type: Number
  },
  actual_amount: {//实收总金额
    type: Number
  },
  has_discount: {
    type: Boolean
  },
  description: {
    type: String,
    default: ''
  },
  deleted_status: {
    type: Boolean,
    default: false
  },
  paid: {
    type: Boolean,
    default: false
  },
  pay_time: {
    type: Date
  },
  cook_time: {
    type: Date
  },
  delivery_time: {
    type: Date
  },
  complete_time: {
    type: Date
  },
  card_number: {
    type: String
  },
  card_id_number: {
    type: String
  },
  card_type: {//普通，员工，专家
    // enum: ['normal', 'staff', 'expert'],
    type: String
  },
  time_tag: {//时间标签。早餐，午餐，晚餐
    type: String
  }
});

OrderSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});


function translateTime(createTime){
 var hour = createTime.getHours();
  if(hour >= 0 && hour < 10){
    return '早餐';
  }
  else if(hour >= 10 && hour < 16){
    return '午餐';
  }else{
    return '晚餐';
  }
}

OrderSchema.pre('save', function (next) {
  this.total_price = 0;
  if(this.goods_orders &&  this.goods_orders.length > 0){
    var totalPrice = 0;
    this.goods_orders.forEach(function(goodsOrder){
      goodsOrder.total_price = goodsOrder.price * goodsOrder.count;
      totalPrice += goodsOrder.total_price;
    });
    this.total_price = totalPrice;
  }
  if(!this.contact){
    this.in_store_deal = true;
  }else{
    this.in_store_deal = false;
  }

  this.has_discount = false;
  if(this.paid && this.actual_amount !== this.total_price){
    this.has_discount = true;
  }

  if(this.create_time){
    this.time_tag = translateTime(this.create_time);
  }

  next();
});

appDb.model('Order', OrderSchema);

