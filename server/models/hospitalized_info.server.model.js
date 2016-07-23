/**
 * Created by elinaguo on 16/6/25.
 */
'use strict';

var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  timestamps = require('mongoose-timestamp');

var HospitalizedInfoSchema = new Schema({
  object:{
    type:String,
    default:'HospitalizedInfo'
  },
  id_number: {//身份证号，标示一个人的唯一性
    type: String
  },
  building: {
    type: Schema.Types.ObjectId,
    ref: 'Building'
  },
  floor: {
    type: Schema.Types.ObjectId,
    ref: 'Floor'
  },
  bed: {
    type: Schema.Types.ObjectId,
    ref: 'Bed'
  },
  nickname: {
    type: String
  },
  sex: {
    type: String
  },
  phone: {//电话
    type: String
  },
  description: {//备注
    type: String
  },
  is_hospitalized: {//是否住院
    type: Boolean,
    default: true
  },
  hospitalized_time: {//入院时间
    type: Date
  },
  hospitalized_creator: {//办理入院手续的人
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  hospitalized_creator_info: {
    type: Schema.Types.Mixed
  },
  is_leave_hospital: {//是否出院
    type: Boolean,
    default: false
  },
  leave_description: {//出院备注
    type: String
  },
  leave_hospital_time: {//出院时间
    type: Date
  },
  leave_hospital_creator: {//办理出院手续的人
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  leave_hospital_creator_info: {//办理出院手续的人
    type: Schema.Types.Mixed
  },
  recent_update_user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  recent_update_user_info: {
    type: Schema.Types.Mixed
  },
  deleted_status: {
    type: Boolean,
    default: false
  },
  change_user: {
    type: Schema.Types.ObjectId
  }
});

HospitalizedInfoSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});


appDb.model('HospitalizedInfo', HospitalizedInfoSchema);