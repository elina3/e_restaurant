/**
 * Created by elinaguo on 16/7/4.
 */
'use strict';

var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  timestamps = require('mongoose-timestamp');

var MealBillSchema = new Schema({
  object:{
    type:String,
    default:'MealBill'
  },
  name: {
    type: String
  },
  price: {//金额，单位：分
    type: Number
  },
  count: {
    type: Number,
    default: 1
  },
  total_price: {//总金额，单位：分
    type: Number
  }
});
appDb.model('MealBill', MealBillSchema);

var BedMealRecordV2Schema = new Schema({
  object: {
    type: String,
    default: 'BedMealRecordV2'
  },
  meal_set_date: {//日期
    type: Date
  },
  hospitalized_info: {//入住信息（包括当前所在的信息）
    type: Schema.Types.ObjectId,
    ref: 'HospitalizedInfo'
  },
  building: {//这个时间点所在的楼（有可能跟hospitalized_info中当前所在的building，floor，bed不一致）
    type: Schema.Types.ObjectId,
    ref: 'Building'
  },
  floor: {//这个时间点所在的楼层
    type: Schema.Types.ObjectId,
    ref: 'Floor'
  },
  bed: {//这个时间点所在的床位
    type: Schema.Types.ObjectId,
    ref: 'Bed'
  },
  meal_tag: {//breakfast, lunch, dinner
    type: String
  },
  meal_type_id: {
    type: String,
    ref: 'MealType'
  },
  meal_type_name: {//healthy_normal,liquid_diets,semi_liquid_diets,diabetic_diets,low_fat_low_salt_diets
    type: String
  },
  meal_type_price: {
    type: Number
  },
  need_choose_package_meal: {
    type: String,
    default: false
  },
  meal_bills: [{
    type: Schema.Types.Mixed
  }],
  amount_due: {
    type: Number
  },
  amount_paid: {
    type: Number
  },
  id_number: {//身份证号，便于搜索
    type: String
  },
  nickname: {//冗余数据
    type: String
  },
  time_tag: {
    type: String
  },
  discount: {
    type: Number,
    default: 1
  },
  checkout_create_id: {
    type: Schema.Types.ObjectId
  },
  is_checkout: {
    type: Boolean,
    default: false
  },
  checkout_time: {
    type: Date
  },
  checkout_creator_info: {
    type: Schema.Types.Mixed
  },
  create_user: {
    type: Schema.Types.ObjectId
  },
  deleted_status: {
    type: Boolean,
    default: false
  },
  change_user: {
    type: Schema.Types.ObjectId
  }
});

BedMealRecordV2Schema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});


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
BedMealRecordV2Schema.pre('save', function (next) {
  this.amount_due = 0;
  if(this.meal_bills &&  this.meal_bills.length > 0){
    var amountDue = 0;
    this.meal_bills.forEach(function(mealBill){
      mealBill.total_price = mealBill.price * mealBill.count;
      amountDue += mealBill.total_price;
    });
    this.amount_due = amountDue;
  }

  this.amount_paid = this.amount_due * this.discount;

  if(this.create_time){
    this.time_tag = translateTime(this.meal_tag);
  }

  next();
});
appDb.model('BedMealRecordV2', BedMealRecordV2Schema);