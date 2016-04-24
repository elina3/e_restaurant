/**
 * Created by elinaguo on 16/4/17.
 */


'use strict';

var _ = require('lodash');

module.exports = _.extend(exports, {
  card_param_null: {type: 'card_param_null', message: 'The card param is null!', zh_message: '该饭卡参数错误！'},
  id_number_null: {type: 'id_number_null', message: 'The card id number is null', zh_message: '证件号为空！'},
  card_number_null: {type: 'card_number_null', message: 'The card number is null', zh_message: '该饭卡卡号为空！'},
  card_id_null: {type: 'card_id_null', message: 'The card id is null', zh_message: '该饭卡id为空！'},

  wrong_status: {type: 'wrong_status',message: 'The card status is wrong.',zh_message: '选择的状态错误！'},
  wrong_amount: {type:'wrong_amount', message: 'The amount is wrong', zh_message: '输入的金额错误！'},
  card_number_exist: {type: 'card_number_exist', message: 'The card number is exist', zh_message: '该卡号已绑定！'},
  id_number_exist: {type: 'card_number_exist', message: 'The card number is exist', zh_message: '该证件号已注册！'},
  insufficient_balance: {type: 'insufficient_balance', message: 'The card has not enough money!', zh_message: '该饭卡余额不足！'},

  card_enabled: {type: 'card_enabled', message: 'THe card is enabled', zh_message: '该饭卡已启用！'},
  card_revoked: {type: 'card_revoked', message: 'The card is revoked', zh_message: '该饭卡已作废！'},
  card_disabled: {type: 'card_disabled', message: 'The card is disabled', zh_message: '该饭卡未启用！'},
  card_frozen: {type: 'card_frozen', message: 'The card is frozen', zh_message: '该饭卡已冻结！'},
  card_closed: {type: 'card_closed', message: 'The card is closed', zh_message: '该饭卡已退卡！'},

  card_not_exist: {type: 'card_not_exist', message: 'This card does not exist!', zh_message: '该饭卡不存在！'},
  card_deleted: {type: 'card_deleted', message: 'This card has been deleted', zh_message: '该饭卡已删除！'},
  card_exist: {type: 'card_exist', message: 'The card is exist!', zh_message: '该饭卡已存在！'},
  new_card_exist: {type: 'new_card_exist', message: 'The new card is exist', zh_message: '新饭卡已使用'},
  need_new_card_number: {type: 'need_new_card_number', message: 'The new card number is equal the old card number', zh_message:'该饭卡的卡号与新卡号重复'}
});
