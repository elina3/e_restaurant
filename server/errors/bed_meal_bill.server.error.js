/**
 * Created by elinaguo on 16/6/25.
 */


'use strict';

var _ = require('lodash');

module.exports = _.extend(exports, {
  invalid_goods_infos: {type: 'invalid_goods_infos', message: 'The goods_infos is invalid', zh_message: '无效的商品信息'},
  no_goods_info: {type: 'no_goods_info', message: 'The goods info is null', zh_message: '没有商品信息'},
  goods_not_all_exist: {type: 'goods_not_all_exist', message: 'The goods is not exist', zh_message: '不是所有商品都存在'},
  healthy_goods_not_all_exist: {type: 'healthy_goods_not_all_exist', message: 'Not all healthy goods exist', zh_message: '不是所有的营养商品都存在'},
  checkout: {type: 'checkout', message: 'The bill is checkout', zh_message: '该餐已结账'}
  //invalid_id_number: {type: 'invalid_id_number', message: 'The id_number is invalid', zh_message: '无效的身份证号'},
  //sicker_info_null: {type: 'sicker_info_null', message: 'The sicker info is null', zh_message: '病人信息为空'},
  //nickname_null: {type: 'nickname_null', message: 'The sicker nickname is null', zh_message: '病人姓名未填'},
  //sicker_hospitalized: {type: 'sicker_hospitalized', message: 'The sicker has been hospitalized', zh_message: '病人已入院'},
  //hospitalized_info_not_exist: {type: 'hospitalized_info_not_exist', message: 'The hospitalizedInfo is not exist', zh_message: '该入院信息不存在'},
  //hospitalized_is_checkout: {type: 'hospitalized_is_checkout', message: 'The hospitalized is checkout', zh_message: '已清算'},
  //hospitalized_info_id_null: {type: 'hospitalized_info_id_null', message: 'The hospitalized info id is null', zh_message: '入住信息id为空'}
});
