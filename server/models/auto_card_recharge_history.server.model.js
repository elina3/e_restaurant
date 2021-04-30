/**
 * Created by elinaguo on 16/4/24.
 */
'use strict';
var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  timestamps = require('mongoose-timestamp');

var AutoCardRechargeHistorySchema = new Schema({
  object: {
    type: String,
    default: 'AutoCardRechargeHistory'
  },
  month_string: {// 例如："2021/05"
    type: String
  },
  card_type: {// staff,expert
    type: String
  },
  total_count: {
    type: Number
  },
  success_count: {
    type: Number
  },
  success_cards: [{
    type: Schema.Types.Mixed
  }],
  failed_count: {
    type: Number
  },
  failed_cards: [{
    type: Schema.Types.Mixed
  }]
});

AutoCardRechargeHistorySchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

appDb.model('AutoCardRechargeHistory', AutoCardRechargeHistorySchema);
