/**
 * Created by elinaguo on 16/6/30.
 */

'use strict';
var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  timestamps = require('mongoose-timestamp');

var BedMealBillCheckoutSchema = new Schema({
  object:{
    type:String,
    default:'BedMealBillCheckout'
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
  bills: [{
    type: Schema.Types.ObjectId,
    ref: 'BedMealBill'
  }],
  amount_due: {//应付金额，单位：分
    type: Number,
    default: 0
  },
  amount_paid: {//实付金额，单位：分
    type: Number,
    default: 0
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
  checkout_creator_id: {
    type: Schema.Types.ObjectId//可以是User也可以是Client
  },
  checkout_creator_info: {
    type: Schema.Types.Mixed
  }
});
BedMealBillCheckoutSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

BedMealBillCheckoutSchema.pre('save', function (next) {
  this.amount_due = 0;
  this.amount_paid = 0;
  if(this.bills &&  this.bills.length > 0){
    var amountDue = 0;
    var amountPaid = 0;
    this.bills.forEach(function(bill){
      amountDue += bill.amount_due;
      amountPaid += bill.amount_paid;
    });

    this.amount_due = amountDue;
    this.amount_paid = amountPaid;
  }
  next();
});
appDb.model('BedMealBillCheckout', BedMealBillCheckoutSchema);