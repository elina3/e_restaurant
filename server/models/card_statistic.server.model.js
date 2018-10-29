/**
 * Created by elinaguo on 16/5/6.
 */

'use strict';
var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  timestamps = require('mongoose-timestamp');
//虚拟充值，现金充值，删卡，退卡统计记录
var CardStatisticSchema = new Schema({
  object:{
    type:String,
    default:'CardStatistic'
  },
  card: {
    type: Schema.Types.ObjectId,
    ref: 'Card'
  },
  card_type: {
    type: String
  },
  id_number: {//证件号
    type: String,
    trim: true
  },
  card_number: {
    type: String
  },
  action: {
    type: String
  },
  amount: {
    type: Number,
  },
  create_user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  card_nickname: {
    type: String
  }
});

CardStatisticSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

appDb.model('CardStatistic', CardStatisticSchema);