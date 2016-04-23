/**
 * Created by elinaguo on 16/4/17.
 */


'use strict';

var _ = require('lodash');

module.exports = _.extend(exports, {
  card_param_null: {type: 'card_param_null', message: 'The card param is null!', zh_message: '该饭卡参数错误！'},
  card_not_exist: {type: 'card_not_exist', message: 'This card does not exist!', zh_message: '该饭卡不存在！'},
  card_deleted: {type: 'card_deleted', message: 'This card has been deleted', zh_message: '该饭卡已删除！'},
  card_money_null: {type: 'card_money_null', message: 'The card has no money', zh_message: '该饭卡没有钱！'},
  card_money_negative: {type:'card_money_negative', message:'The card money is not allowed unsigned', zh_message: '该饭卡不允许被使用！'},
  card_number_null: {type: 'card_number_null', message: 'The card number is null', zh_message: '该饭卡卡号为空'},
  card_id_null: {type: 'card_id_null', message: 'The card id is null', zh_message: '该饭卡id为空'},
  card_exist: {type: 'card_exist', message: 'The card is exist!', zh_message: '该饭卡已存在！'},
  insufficient_balance: {type: 'insufficient_balance', message: 'The card has not enough money!', zh_message: '该饭卡余额不足！'},
  card_disabled: {type: 'card_disabled', message: 'The card is disabled', zh_message: '该饭卡已冻结'}
});
