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

var ContactSchema = new Schema({
  object:{
    type:String,
    default:'Contact'
  },
  name: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  mobile_phone: {
    type: String
  },
  email: {
    type: String
  },
  usual: {
    type: Boolean,
    default: false
  }
});

appDb.model('Contact', ContactSchema);

var ClientSchema = new Schema({
  object:{
    type:String,
    default:'Client'
  },
  username: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    default: ''
  },
  nickname: {
    type: String
  },
  sex: {
    type: String,
    enum: ['male', 'female', 'unknown'],
    default: 'unknown'
  },
  role: {
    type: String,
    enum: ['normal', 'waiter', 'cashier', 'milk_cashier'],
    default: 'normal'
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
  description: {//描述
    type: String
  },
  head_photo: {
    type: String
  },
  salt: {
    type: String,
    default: 'secret'
  },
  cart: {//购物车
    type: Schema.Types.Mixed
  },
  contacts: [{
    type: Schema.Types.Mixed
  }],
  deleted_status: {
    type: Boolean,
    default: false
  }
});
ClientSchema.methods.hashPassword = function (password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
  } else {
    return password;
  }
};
ClientSchema.methods.authenticate = function (password) {
  return this.password === this.hashPassword(password);
};
ClientSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});
appDb.model('Client', ClientSchema);


var CartGoodsSchema = new Schema({
  object: {
    type: 'String',
    default: 'CartGoods'
  },
  goods_id: {
    type: Schema.Types.ObjectId
  },
  display_photos: [{
    type: String
  }],
  count: {
    type: Number
  },
  name: {
    type: String
  },
  price: {
    type: Number
  }
});
appDb.model('CartGoods', CartGoodsSchema);
var CartSchema = new Schema({
  object: {
    type: 'String',
    default: 'Cart'
  },
  total_count: {
    type: Number
  },
  total_price: {
    type: Number
  },
  cart_goods: [{
    type: Schema.Types.Mixed
  }]
});
appDb.model('Cart', CartSchema);


ClientSchema.pre('save', function (next) {
  if(this.cart){
    this.cart.total_count = 0;
    this.cart.total_price = 0;
  }

  if(this.cart && this.cart.cart_goods && this.cart.cart_goods.length > 0){
    this.cart.total_count = 0;
    this.cart.total_price = 0;
    var totalPrice = 0;
    this.cart.cart_goods.forEach(function(goods){
      totalPrice += (goods.price * goods.count);
    });
    this.cart.total_price = totalPrice;
    this.cart.total_count = this.cart.cart_goods.length;
  }
  next();
});
