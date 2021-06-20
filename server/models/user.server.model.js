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


var UserSchema = new Schema({
  object:{
    type:String,
    default:'User'
  },
  username: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['admin', 'card_manager','normal_card_manager','staff_card_manager', 'cooker', 'delivery', 'nurse', 'registrar', 'supermarket_manager', 'milk_manager']//管理员，饭卡管理员, 普通饭卡管理员, 员工专家饭卡管理员, 厨师，配送员，,护士, 登记员,超市管理员
  },
  nickname: {
    type: String
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group'
  },
  hospital: {
    type: Schema.Types.ObjectId,
    ref: 'Hospital'
  },
  sex: {
    type: String,
    enum: ['male', 'female', 'unknown'],
    default: 'unknown'
  },
  mobile_phone: {
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


UserSchema.methods.hashPassword = function (password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
  } else {
    return password;
  }
};

UserSchema.methods.authenticate = function (password) {
  return this.password === this.hashPassword(password);
};

UserSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

appDb.model('User', UserSchema);
