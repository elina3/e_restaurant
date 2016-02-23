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


var GroupSchema = new Schema({
  object:{
    type:String,
    default:'Group'
  },
  name: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    default: ''
  },
  wechat_app_info: {
    type: Schema.Types.Mixed
  },
  deleted_status: {
    type: Boolean,
    default: false
  }
});



GroupSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

appDb.model('Group', GroupSchema);
