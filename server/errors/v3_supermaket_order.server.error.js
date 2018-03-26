'use strict';

var _ = require('lodash');

module.exports = _.extend(exports, {
  amount_invalid: {type: 'amount_invalid', message: 'The order amount is invalid!', zh_message: '该超市订单金额不正确'},
  actual_amount_invalid: {type: 'actual_amount_invalid', message: 'The order discount amount is invalid!', zh_message: '该超市订单折扣金额不正确'},
  supermarket_consumption_amount_not_enough: {type: 'supermarket_consumption_amount_not_enough', message: 'The amount is not enough for supermarket consumption!Only {{value1}} yuan for supermarket consumption this month！', zh_message: '超市消费余额不足，当月仅剩{{value1}}元供超市消费'},
  supermarket_consumption_card_amount_not_enough: {type: 'supermarket_consumption_card_amount_not_enough', message: 'The card amount is not enough for supermarket consumption!Only {{value1}} yuan in the card！', zh_message: '卡内消费余额不足，卡内仅剩{{value1}}元'},
  card_amount_not_enough: {type: 'card_amount_not_enough', message: 'The amount is not enough in card!Only {{value1}} yuan！', zh_message: '卡内余额不足，仅剩{{value1}}元'},
  card_not_support_pay: {type: 'card_not_support_pay', message: 'The card type is support to pay！', zh_message: '该卡类型不支持使用'},
  expert_not_support: {type: 'expert_not_support', message: 'The card of expert is not support to pay！', zh_message: '专家卡不支持消费'},



});
