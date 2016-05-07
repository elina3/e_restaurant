/**
 * Created by elinaguo on 16/2/26.
 */
'use strict';

var _ = require('lodash');

module.exports = _.extend(exports, {
  user_exist: {type: 'user_exist', message: 'This user is exist!', zh_message: '该用户已存在'},
  group_exist: {type: 'group_exist', message: 'This group is exist', zh_message: '该组已存在'},
  hospital_not_exist: {type: 'hospital_not_exist', message: 'The hospital is not exist', zh_message: '该医院不存在'},
  group_not_exist: {type: 'group_not_exist', message: 'This group is not exist', zh_message: '该组不存在'},
  group_id_null: {type: 'group_id_null', message: 'Group id is null', zh_message: '该组id为空'},
  user_not_exist: {type: 'user_not_exist', message: 'The user is not exist', zh_message: '用户不存在'},
  user_deleted: {type: 'user_deleted', message: 'The user has been deleted', zh_message: '用户已删除'},
  admin_exist: {type: 'admin_exist', message: 'The admin is exist', zh_message: '管理员账户已存在'}
});
