/**
 * Created by elinaguo on 16/6/25.
 */
'use strict';
var mealTypes = require('../enums/business').meal_types.all_enums;

var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  timestamps = require('mongoose-timestamp');

var BedMealBillSchema = new Schema({
  object:{
    type:String,
    default:'BedMealBill'
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
  hospitalized_info: {//入住信息
    type: Schema.Types.ObjectId,
    ref: 'HospitalizedInfo'
  },
  bed_meal_record: {
    type: Schema.Types.ObjectId,
    ref: 'BedMealRecord'
  },
  meal_set_date: {//就餐日期
    type: Date
  },
  meal_tag: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner']
  },
  meal_type: {
    enum: mealTypes,
    type: String
  },
  id_number: {//身份证号，标示一个人的唯一性，冗余数据（可以通过hospitalized_info populate后获取）
    type: String
  },
  nickname: {//冗余数据（可以通过hospitalized_info populate后获取）
    type: String
  },
  goods_bills: [{
    type: Schema.Types.Mixed
  }],
  amount_due: {//应付金额，单位：分
    type: Number,
    default: 0
  },
  amount_paid: {//实付金额，单位：分
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 1
  },
  deleted_status: {
    type: Boolean,
    default: false
  },
  creator_id: {
    type: Schema.Types.ObjectId//可以是User也可以是Client
  },
  creator_info: {
    type: Schema.Types.Mixed
  },
  recent_modify_user_id: {//可以是User也可以是Client
    type: Schema.Types.ObjectId
  },
  recent_modify_user_info: {
    type: Schema.Types.Mixed
  },
  time_tag: {//早餐，午餐，晚餐  //根据时间自动生成
    type: String
  },
  is_checkout: {//是否结账
    type: Boolean,
    default: false
  },
  checkout_creator_id: {
    type: Schema.Types.ObjectId//可以是User也可以是Client
  },
  checkout_creator_info: {
    type: Schema.Types.Mixed
  },
  is_cancel: {
    type: Boolean,
    default: false
  },
  cancel_creator_id: {
    type: Schema.Types.ObjectId//可以是User也可以是Client
  },
  cancel_creator_info: {
    type: Schema.Types.Mixed
  }
});
BedMealBillSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});
appDb.model('BedMealBill', BedMealBillSchema);

function translateTime(mealTag){
  var result = '';
  switch(mealTag){
    case 'breakfast':
      result = '早餐';
      break;
    case 'lunch':
      result = '午餐';
      break;
    case 'dinner':
      result = '晚餐';
      break;
  }
  return result;
}
BedMealBillSchema.pre('save', function (next) {
  this.amount_due = 0;
  if(this.goods_bills &&  this.goods_bills.length > 0){
    var amountDue = 0;
    this.goods_bills.forEach(function(goodsBill){
      goodsBill.total_price = goodsBill.price * goodsBill.count;
      amountDue += goodsBill.total_price;
    });
    this.amount_due = amountDue;
  }

  this.amount_paid = this.amount_due * this.discount;

  if(this.create_time){
    this.time_tag = translateTime(this.meal_tag);
  }

  next();
});