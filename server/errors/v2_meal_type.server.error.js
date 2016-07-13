/**
 * Created by elinaguo on 16/7/4.
 */
'use strict';

var _ = require('lodash');

module.exports = _.extend(exports, {
  name_null: {type: 'name_null', message: 'This meal type name is null!', zh_message: '餐种类型名称为空'},
  nickname_null: {type: 'nickname_null', message: 'This meal type nickname is null', zh_message: '餐种显示名称为空'},
  invalid_breakfast_price: {type: 'invalid_breakfast_price', message: 'The breakfast price is invalid', zh_message: '早餐价格无效'},
  invalid_lunch_price: {type: 'invalid_lunch_price', message: 'The lunch price is invalid', zh_message: '午餐价格无效'},
  invalid_dinner_price: {type: 'invalid_dinner_price', message: 'The dinner price is invalid', zh_message: '晚餐价格无效'},
  package_meals_null: {type: 'package_meals_null', message: 'The package meal is null', zh_message: '套餐不存在'},
  invalid_package_meals: {type: 'invalid_package_meals', message: 'The package meals are invalid', zh_message: '套餐无效'},
  meal_type_exist: {type: 'meal_type_exist', message: 'The meal type is exist', zh_message: '该餐种已经存在'},
  meal_type_not_exist: {type: 'meal_type_not_exist', message: 'The meal type is not exist', zh_message: '该餐种不存在'},
  meal_type_deleted: {type: 'meal_type_deleted', message: 'The meal type is deleted', zh_message: '该餐种已删除'},
  leave_hospital: {type: 'leave_hospital', message: 'The sicker is leave hospital', zh_message: '该病人已出院'},
  package_meals_name_repeat: {type: 'package_meals_name_repeat', message: 'The package meals name are repeat', zh_message: '套餐名重复'},
  need_choose_package_meal_null: {type: 'need_choose_package_meal_null', message: 'There is no choose meal type ', zh_message: '请选择餐种类型'}

});
