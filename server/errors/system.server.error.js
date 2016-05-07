'use strict';

var _ = require('lodash');

module.exports = _.extend(exports, {
  internal_system_error: {type: 'internal_system_error', message: 'internal system error', zh_message: '系统内部错误'},
  database_query_error: {type: 'database_query_error', message: 'Database query failed', zh_message: '数据库查询出错'},
  network_error: {type: 'network_error', message: 'The network is error', zh_message: '网络出错'},
  account_not_match: {type: 'account_not_match', message: 'this account does not match', zh_message: '账户密码不匹配'},
  account_not_exist: {type: 'account_not_exist', message: 'this account does not exist', zh_message: '账户不存在'},
  account_existed: {type: 'account_existed', message: 'this account existed', zh_message: '账户已存在'},
  account_deleted: {type: 'account_deleted', message: 'this account has been deleted', zh_message: '账户已删除'},
  no_access_token: {type: 'no_access_token', message: 'This access token is null', zh_message: '没有访问凭据'},
  invalid_access_token: {type: 'invalid_access_token', message: 'the access token invalid', zh_message: '访问凭据失效，重新登录'},
  invalid_password: {type: 'invalid_password', message: 'invalid password', zh_message: '无效密码'},
  invalid_account: {type: 'invalid_account', message: 'invalid account', zh_message: '无效账户'},
  param_null_error: {type: 'param_null_error', message: 'the param is null', zh_message: '参数为空'},
  param_analysis_error: {type: 'param_analysis_error', message: 'the param analysis failed', zh_message: '参数解析错误'},
  database_save_error: {type: 'database_save_error', message: 'database save error', zh_message: '数据库保存出错'},
  no_permission: {type: 'no_permission', message: 'you do not have the permission to operate it', zh_message: '没有权限'}
});
