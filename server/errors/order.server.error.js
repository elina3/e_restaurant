/**
 * Created by elinaguo on 16/2/26.
 */
'use strict';

var _ = require('lodash');

module.exports = _.extend(exports, {
  order_not_exist: {type: 'order_not_exist', message: 'This order is not exist!', zh_message: '订单不存在！'},
  order_deleted: {type: 'order_deleted', message: 'This order has been deleted', zh_message: '订单已删除！'},
  order_not_paid: {type: 'order_not_paid', message: 'The order is not paid!', zh_message: '订单未支付！'},
  order_paid: {type: 'order_paid', message: 'The order has been paid', zh_message: '订单已支付！'},
  goods_cook_complete: {type: 'goods_cook_complete', message: 'The goods cook completed'},
  goods_not_cook_complete: {type: 'goods_not_cook_complete', message: 'The goods not cook complete'},
  no_goods_to_order: {type: 'no_goods_to_order', message: 'There is no goods to Order'},
  goods_order_id_null_error: {type: 'goods_order_id_null_error', message: 'The goods order id is null'},
  order_id_null_error: {type: 'order_id_null_error', message: 'The order id is null', zh_message: '订单id为空！'},
  goods_order_not_exist: {type: 'goods_order_not_exist', message: 'The goods order is not exist'},
  no_contact_info: {type: 'no_contact_info', message: 'There is no contact info!'},
  uncompleted_contact: {type: 'uncompleted_contact', message: 'There is un completed contact!'}
});
