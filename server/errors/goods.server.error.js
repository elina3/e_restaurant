/**
 * Created by elinaguo on 15/10/14.
 */
'use strict';

var _ = require('lodash');

module.exports = _.extend(exports, {
  goods_not_exist: {type: 'goods_not_exist', message: 'This goods is not exist!'},
  goods_deleted: {type: 'goods_deleted', message: 'This goods has been deleted'},
  goods_name_null: {type: 'goods_name_null', message: 'The goods name is null!'},
  goods_price_null: {type: 'goods_price_null', message: 'The goods has no price'},
  goods_id_null: {type: 'goods_id_null', message: 'The goods id is null'}
});
