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
    enum: ['normal', 'staff'],
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
  }
});

CardSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

appDb.model('Card', CardSchema);
