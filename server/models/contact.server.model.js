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
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client'
  },
  name: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  mobile: {
    type: String
  },
  email: {
    type: String
  },
  common: {
    type: Boolean,
    default: false
  },
  deleted_status: {
    type: Boolean,
    default: false
  }
});

ContactSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

appDb.model('Contact', ContactSchema);
