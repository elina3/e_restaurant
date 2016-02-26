'use strict';

var _ = require('lodash');

module.exports = _.extend(exports, {
  internal_system_error: {type: 'internal_system_error', message: 'internal system error'},
  database_query_error: {type: 'database_query_error', message: 'Database query failed'},
  network_error: {type: 'network_error', message: 'The network is error'},
  account_not_match: {type: 'account_not_match', message: 'this account does not match'},
  account_not_exist: {type: 'account_not_exist', message: 'this account does not exist'},
  account_existed: {type: 'account_existed', message: 'this account existed'},
  account_deleted: {type: 'account_deleted', message: 'this account has been deleted'},
  no_access_token: {type: 'no_access_token', message: 'This access token is null'},
  invalid_access_token: {type: 'invalid_access_token', message: 'the access token invalid'},
  invalid_password: {type: 'invalid_password', message: 'invalid password'},
  invalid_account: {type: 'invalid_account', message: 'invalid account'},
  param_null_error: {type: 'param_null_error', message: 'the param is null'},
  param_analysis_error: {type: 'param_analysis_error', message: 'the param analysis failed'},
  database_save_error: {type: 'database_save_error', message: 'database save error'},
  no_permission: {type: 'no_permission', message: 'you do not have the permission to operate it'}
});
