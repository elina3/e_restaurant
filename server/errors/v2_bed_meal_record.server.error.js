/**
 * Created by elinaguo on 16/7/4.
 */
var _ = require('lodash');

module.exports = _.extend(exports, {
  not_all_meal_type_exist: {type: 'not_all_meal_type_exist', message: 'The meal type is not all exist', zh_message: '不是所有的餐种类型都存在'},
  not_all_meal_type_has_price: {type: 'not_all_meal_type_has_price', message: 'The meal type is not all has price', zh_message: '不是所有的餐种类型都设置价钱'},
  bed_meal_record_has_checkout: {type: 'bed_meal_record_has_checkout', message: 'The bed meal records are not all unchecked', zh_message: '已经有账单已结账'},
  invalid_bed_meal_record_info: {type: 'invalid_bed_meal_record_info', message: 'The bed meal record info are invalid', zh_message: '无效的bed_meal_record记录'},
  not_all_hospitalized_info_exist: {type: 'not_all_hospitalized_info_exist', message: 'The hospitalized info are not all exist', zh_message: '不是所有的病人入住信息都在'},
  has_left_hospital_sicker: {type: 'has_left_hospital_sicker', message: 'There are some sicker have been left hospital', zh_message: '有些病人已出院'},
  invalid_hospitalized_info_ids: {type: 'invalid_hospitalized_info_ids', message: 'The hospitalized info ids is invalid', zh_message: '入住信息ids无效'},
  invalid_bed_meal_record_id: {type: 'invalid_bed_meal_record_id', message:'The bed meal record id is invalid', zh_message: 'bed_meal_record_id无效'},
  bed_meal_record_not_exist: {type: 'bed_meal_record_not_exist', message: 'The bed meal record is not exist', zh_message: '该床位营养餐设置不存在'},
  bed_meal_record_deleted: {type: 'bed_meal_record_deleted', message: 'The bed meal record is deleted', zh_message: '该床位营养餐设置记录已删除'},
  no_meal_tag: {type: 'no_meal_tag', message: 'There is no meal tag', zh_message: '没有传递meal_tag餐点'},
  invalid_package_meals: {type: 'invalid_package_meals', message: 'The package meals are invalid', zh_message: '请传递有效的套餐'},
  wrong_package_meal_count: {type: 'wrong_package_meal_count', message: 'The package meals count is wrong', zh_message: '套餐数量与系统内不一致，请刷新页面'},
  no_package_meals: {type: 'no_package_meals', message: 'Please choose one package meal at least', zh_message: '请至少选择一份有效的套餐'},
  bed_meal_record_checkout: {type: 'bed_meal_record_checkout', message: 'The bed meal record is checkout', zh_message: '该账单已清账'},
  invalid_package_meal_count: {type: 'invalid_package_meal_count', message: 'The package meal count is invalid', zh_message: '套餐数量设置出错'},
  package_meal_not_exist: {type: 'package_meal_not_exist', message: 'The package meal is not exist', zh_message: '该套餐不存在'},
  the_bed_has_been_hospitalized: {type: 'the_bed_has_been_hospitalized', message: 'The bed has been hospitalized', zh_message: '该床位已经入住病人'},
  the_bed_has_no_sicker: {type: 'the_bed_has_no_sicker', message: 'The bed has no sicker', zh_message: '该床位没有入住病人'}
});