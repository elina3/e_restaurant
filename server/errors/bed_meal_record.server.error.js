/**
 * Created by elinaguo on 16/6/13.
 */

'use strict';

var _ = require('lodash');

module.exports = _.extend(exports, {
  bed_meal_record_exist: {type: 'bed_meal_record_exist', message: 'The bed meal record is exist', zh_message: '该床位营养餐设置已存在'},
  invalid_bed_meal_record_ids: {type: 'invalid_bed_meal_record_ids', message: 'The bed meal record ids is invalid', zh_message: '营养餐记录id无效'},
  invalid_bed_meall_infos: {type: 'invalid_bed_meall_infos', message: 'The bed meal record infos is invalid', zh_message: '营养餐记录信息无效'},
  meal_tag_param_null: {type: 'meal_tag_param_null', message: 'The meal_tag param is null', zh_message: 'meal_tag参数为空'},
  time_out: {type: 'time_out', message: 'Can not set meal for beds in passed days', zh_message: '不能修改今天以前的记录'}
});
