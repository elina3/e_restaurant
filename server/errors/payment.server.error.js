/**
 * Created by elinaguo on 16/4/17.
 */

'use strict';

var _ = require('lodash');

module.exports = _.extend(exports, {
  not_support_method: {type: 'not_support_method', message: 'The pay method is not support now!', zh_message: '支付方式目前不支持'},
  order_paid: {type: 'order_paid', message: 'The order is paid!', zh_message: '订单支付失败'},
  order_deleted: {type: 'order_deleted', message: 'The order is deleted', zh_message: '订单已删除'},
  update_order_to_paid_error: {type: 'update_order_to_paid_error', message: 'Update the order status paid failed', zh_message: '更新订单支付状态失败'},
  insufficient_balance: {type: 'insufficient_balance', message: 'The card is insufficient balance', zh_message: '卡内余额不足'}
});
