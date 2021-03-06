/**
 * Created by elinaguo on 16/6/12.
 */


'use strict';

var _ = require('lodash');

module.exports = _.extend(exports, {
  building_name_null: {type: 'building_name_null', message: 'The building name is null', zh_message: '楼名为空'},
  building_exist: {type: 'building_exist', message: 'The building in hospital is exist!', zh_message: '该栋楼已存在！'},
  building_not_exist: {type: 'building_not_exist', message: 'The building is not exist', zh_message: '该楼不存在'},
  floor_name_null: {type: 'floor_name_null', message: 'The floor name is null', zh_message: '楼层名为空'},
  floor_exist: {type: 'floor_exist', message: 'The floor in building is exist', zh_message: '该楼层已存在'},
  floor_not_exist: {type: 'floor_not_exist', message: 'The floor is not exist', zh_message: '该楼层不存在'},
  bed_name_null: {type: 'bed_name_null', message: 'The bed name is null', zh_message: '床位名为空'},
  bed_exist: {type: 'bed_exist', message: 'The bed in floor is exist', zh_message: '该楼层床位已存在'},
  bed_not_exist: {type: 'bed_not_exist', message: 'The bed is not exist', zh_message: '该楼层床位不存在'},
  building_id_null: {type: 'building_id_null', message: 'The building id is null', zh_message: 'building_id为空'},
  floor_id_null: {type: 'floor_id_null', message: 'The floor id is null', zh_message: 'floor_id为空'},
  bed_id_null: {type: 'bed_id_null', message: 'The bed id is null', zh_message: 'bed_id为空'}
});
