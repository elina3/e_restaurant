/**
 * Created by elinaguo on 16/4/24.
 */
'use strict';
var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  timestamps = require('mongoose-timestamp');

var CardHistorySchema = new Schema({
  object:{
    type:String,
    default:'CardHistory'
  },
  card: {
    type: Schema.Types.ObjectId,
    ref: 'Card'
  },
  new_card: {//补卡才有
    type: Schema.Types.ObjectId,
    ref: 'Card'
  },
  id_number: {//证件号
    type: String,
    trim: true
  },
  card_number: {
    type: String
  },
  new_card_number: {//补卡时才有
    type: String
  },
  action: {
    type: String
  },
  amount: {
    type: Number,
  },
  new_amount: {
    type: Number
  },
  description: {
    type: String
  },
  deleted_status: {
    type: Boolean,
    default: false
  },
  create_user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  create_client: {
    type: Schema.Types.ObjectId,
    ref: 'Client'
  },
  supermarket_order: {
    type: Schema.Types.Object,
    ref: 'SupermarketOrder'
  }
});

CardHistorySchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

appDb.model('CardHistory', CardHistorySchema);
