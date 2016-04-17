/**
 * Created by elinaguo on 16/2/26.
 */
'use strict';

var _ = require('lodash');

module.exports = _.extend(exports, {
  client_exist: {type: 'client_exist', message: 'This use is exist!'},
  client_not_exist: {type: 'client_not_exist', message: 'The client is not exist'},
  client_deleted: {type: 'client_deleted', message: 'The client is deleted'},
  add_goods_count_invalid: {type: 'add_goods_count_invalid', message: 'There is wrong goods count to add to client cart!'},
  wrong_goods_count_to_udpate_cart: {type: 'wrong_goods_count_to_udpate_cart', message: 'Wrong number to add or remove goods to cart'}
});
