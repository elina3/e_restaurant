/**
 * Created by elinaguo on 16/6/25.
 */


'use strict';

var _ = require('lodash');

module.exports = _.extend(exports, {
  invalid_id_number: {type: 'invalid_id_number', message: 'The id_number is invalid', zh_message: '无效的身份证号'},
  sicker_info_null: {type: 'sicker_info_null', message: 'The sicker info is null', zh_message: '病人信息为空'},
  nickname_null: {type: 'nickname_null', message: 'The sicker nickname is null', zh_message: '病人姓名未填'},
  sicker_hospitalized: {type: 'sicker_hospitalized', message: 'The sicker has been hospitalized', zh_message: '病人已入院'},
  hospitalized_info_not_exist: {type: 'hospitalized_info_not_exist', message: 'The hospitalizedInfo is not exist', zh_message: '该入院信息不存在'},
  bed_is_hospitalized: {type: 'bed_is_hospitalized', message: 'The bed is hospitalized', zh_message: '该床位已入住病人'},
  is_leave_hospital: {type: 'is_leave_hospital', message: 'The sicker has been leave from hospital', zh_message: '病人已出院'},
  bill_not_checkout: {type: 'bill_not_checkout', message: 'The bill is not checkout', zh_message: '账单还未清算完'},
  hospitalized_info_id_null: {type: 'hospitalized_info_id_null', message: 'The hospitalized info id is null', zh_message: '入住信息id为空'},
  invalid_bed_id: {type: 'invalid_bed_id', message: 'The bed id is invalid', zh_message: '需要更换的床位id无效'}
});
