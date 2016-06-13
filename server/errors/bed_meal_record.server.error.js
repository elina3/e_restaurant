/**
 * Created by elinaguo on 16/6/13.
 */

'use strict';

var _ = require('lodash');

module.exports = _.extend(exports, {
  bed_meal_record_exist: {type: 'bed_meal_record_exist', message: 'The bed meal record is exist', zh_message: '该床位营养餐设置已存在'},
  time_out: {type: 'time_out', message: 'Can not set meal for beds in passed days', zh_message: '不能修改今天以前的记录'}
});
