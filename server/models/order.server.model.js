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
  group_name: {
    enum: ['餐厅', '超市'],
    type: String
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
  },
  paid: {
    type: Boolean,
    default: false
  }
});

OrderSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

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
  next();
});

appDb.model('Order', OrderSchema);

