/**
 * Created by elinaguo on 15/10/14.
 */
'use strict';

var _ = require('lodash');

module.exports = _.extend(exports, {
  goods_not_exist: {type: 'goods_not_exist', message: 'This goods is not exist!', zh_message: '商品不存在'},
  goods_deleted: {type: 'goods_deleted', message: 'This goods has been deleted', zh_message: '商品已删除'},
  goods_name_null: {type: 'goods_name_null', message: 'The goods name is null!', zh_message: '商品名称为空'},
  goods_price_null: {type: 'goods_price_null', message: 'The goods has no price', zh_message: '商品价钱为空'},
  goods_id_null: {type: 'goods_id_null', message: 'The goods id is null', zh_message: '商品id为空'},
  not_all_healthy_goods: {type: 'not_all_healthy_goods', message: 'The healthy goods not all exist', zh_message: '不是所有的营养餐商品都存在'}

});
