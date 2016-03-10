/**
 * Created by elinaguo on 16/2/26.
 */
'use strict';

var _ = require('lodash');

module.exports = _.extend(exports, {
  client_exist: {type: 'client_exist', message: 'This use is exist!'},
  client_not_exist: {type: 'client_not_exist', message: 'The client is not exist'},
  client_deleted: {type: 'client_deleted', message: 'The client is deleted'}
});
