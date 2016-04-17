/**
 * Created by elinaguo on 16/4/17.
 */

'use strict';

var _ = require('lodash');

module.exports = _.extend(exports, {
  not_support_method: {type: 'not_support_method', message: 'The pay method is not support now!'},
  order_paid: {type: 'order_paid', message: 'The order is paid!'},
  update_order_to_paid_error: {type: 'update_order_to_paid_error', message: 'Update the order status paid failed'},
  insufficient_balance: {type: 'insufficient_balance', message: 'The card is insufficient balance'}
});
