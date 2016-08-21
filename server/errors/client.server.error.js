/**
 * Created by elinaguo on 16/2/26.
 */
'use strict';

var _ = require('lodash');

module.exports = _.extend(exports, {
  phone_null: {type: 'phone_null', message: 'The phone number is null', zh_message: '电话号码为空'},
  invalid_phone: {type: 'invalid_phone', message: 'The phone number is invalid', zh_message: '无效的电话号码'},
  client_exist: {type: 'client_exist', message: 'This use is exist!',zh_message: '该用户已存在'},
  client_not_exist: {type: 'client_not_exist', message: 'The client is not exist', zh_message: '该用户不存在'},
  client_deleted: {type: 'client_deleted', message: 'The client is deleted', zh_message: '该用户已删除'},
  add_goods_count_invalid: {type: 'add_goods_count_invalid', message: 'There is wrong goods count to add to client cart!',zh_message: '添加商品数量出错'},
  wrong_goods_count_to_udpate_cart: {type: 'wrong_goods_count_to_udpate_cart', message: 'Wrong number to add or remove goods to cart',zh_message: '添加或移出商品数量出错'}
});
