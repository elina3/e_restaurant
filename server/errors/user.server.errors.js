/**
 * Created by elinaguo on 16/2/26.
 */
'use strict';

var _ = require('lodash');

module.exports = _.extend(exports, {
  user_exist: {type: 'user_existed', message: 'This use is exist!'},
  group_exist: {type: 'group_exist', message: 'This group is exist'},
  group_not_exist: {type: 'group_not_exist', message: 'This group is not exist'},
  group_id_null: {type: 'group_id_null', message: 'Group id is null'},
  user_not_exist: {type: 'user_not_exist', message: 'The user is not exist'}
});
