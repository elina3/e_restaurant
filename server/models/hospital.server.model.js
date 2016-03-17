/**
 * Created by elinaguo on 16/3/14.
 */
'use strict';

var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  timestamps = require('mongoose-timestamp'),
  crypto = require('crypto');

var HospitalSchema = new Schema({
  object:{
    type:String,
    default:'Hospital'
  },
  name: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    default: ''
  },
  groups: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Group'
    }
  ],
  admins: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  deleted_status: {
    type: Boolean,
    default: false
  }
});



HospitalSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

appDb.model('Hospital', HospitalSchema);
