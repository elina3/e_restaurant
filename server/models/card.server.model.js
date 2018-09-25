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
  id_number: {//证件id
    type: String,
    trim: true
  },
  card_number: {
    type: String,
    trim: true,
  },
  nickname: {
    type: String
  },
  status: {
    enum: ['disabled', 'enabled', 'frozen', 'revoked', 'close'],//不可用，启用，冻结，撤销，退卡关闭
    default: 'disabled',
    type: String
  },
  type: {
    enum: ['normal', 'staff', 'expert'],//普通，员工，专家
    type: String,
    default: 'normal'
  },
  discount: {
    type: Number,
    default: 1
  },
  amount: {
    type: Number,//余额（元）
    default:0
  },
  deleted_status: {
    type: Boolean,
    default: false
  },
  create_user: {
    type: Schema.Types.ObjectId,
    ref:'User'
  },
  recent_modify_user: {
    type: Schema.Types.ObjectId,
    ref:'User'
  },
  self_change_password: {
    type: Boolean,
    default: false
  },
  change_password_user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  password: {
    type: String
  },
  salt: {
    type: String,
    default: 'secret'
  },
  is_updated: {//用于更新card_type作为标识
    type: Boolean
  }
});

CardSchema.methods.hashPassword = function (password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
  } else {
    return password;
  }
};
CardSchema.methods.authenticate = function (password) {
  return this.password === this.hashPassword(password);
};

CardSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

appDb.model('Card', CardSchema);
