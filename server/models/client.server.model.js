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
  roles: {
    type: String,
    enum: ['admin', 'waiter'],
    default: 'waiter'
  },
  nickname: {
    type: String
  },
  sex: {
    type: String,
    enum: ['male', 'female', 'unknown'],
    default: 'unknown'
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
