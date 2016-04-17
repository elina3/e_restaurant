/**
 * Created by elinaguo on 16/4/17.
 */


'use strict';

var _ = require('lodash');

module.exports = _.extend(exports, {
  card_param_null: {type: 'card_param_null', message: 'The card param is null!'},
  card_not_exist: {type: 'card_not_exist', message: 'This card does not exist!'},
  card_deleted: {type: 'card_deleted', message: 'This card has been deleted'},
  card_money_null: {type: 'card_money_null', message: 'The card has no money'},
  card_number_null: {type: 'card_number_null', message: 'The card number is null'},
  card_id_null: {type: 'card_id_null', message: 'The card id is null'},
  card_exist: {type: 'card_exist', message: 'The card is exist!'},
  insufficient_balance: {type: 'insufficient_balance', message: 'The card has not enough money!'},
  card_disabled: {type: 'card_disabled', message: 'The card is disabled'}
});
