/**
 * Created by elinaguo on 16/7/4.
 */
'use strict';

var bedMealRecordController = require('../controllers/v2_bed_meal_record');
var authFilter = require('../filters/auth'),
  bedFilter = require('../filters/bed'),
  hospitalizedInfoFilter = require('../filters/hospitalized_info'),
  mealTypeFilter = require('../filters/v2_meal_type'),
  paginationFilter = require('../filters/pagination'),
  bedMealRecordFilter = require('../filters/v2_bed_meal_record');

module.exports = function (app) {
  //营养餐设置页面保存
  app.route('/v2/bed_meal_records/batch_save').post(authFilter.requireUser,
    bedFilter.requireBuilding,
    bedFilter.requireFloor,
    bedMealRecordController.batchSaveBedMealRecords);

  app.route('/v2/bed_meal_records/copy_previous_setting').post(authFilter.requireUser,
    bedFilter.requireBuilding,
    bedFilter.requireFloor,
    bedMealRecordController.copyPreviousSetting
  );


  //营养餐设置页面搜索结果
  app.route('/v2/bed_meal_records').get(authFilter.requireUser,
    bedFilter.requireBuilding,
    bedFilter.requireFloor,
    bedMealRecordController.getBedMealRecords);

  //根据条件获取订餐表内容
  app.route('/v2/bed_meal_bills').get(authFilter.requireUser,
    paginationFilter.requirePagination,
    bedMealRecordController.getBedMealRecordsByPagination);

  //根据条件导出订单内容
  app.route('/v2/bed_meal_bills/exports').get(authFilter.requireUser,
    bedMealRecordController.getMealBills);

  //获取病人账单
  app.route('/v2/hospitalized_bills').get(authFilter.requireUser,
    paginationFilter.requirePagination,
    bedMealRecordController.getMealBillByHospitalizedId);

  //病人结账
  app.route('/v2/hospitalized_bills/pay').post(authFilter.requireUser,
    hospitalizedInfoFilter.requireHospitalizedInfo,
    bedMealRecordController.checkoutByHospitalizedInfo);

  //客户端选餐之前获取选餐设置记录（用于生成筛选条件）
  app.route('/v2/client/bed_meal_records').get(authFilter.requireClient,
    bedFilter.requireBuilding,
    bedFilter.requireFloor,
    bedMealRecordController.getBedMealRecordsByClient);

  //客户端选餐保存
  app.route('/v2/client/bed_meal_record/save').post(authFilter.requireClient,
    hospitalizedInfoFilter.requireHospitalizedInfo,
    bedMealRecordFilter.requireBedMealRecord,
    mealTypeFilter.requireMealType,
    bedMealRecordController.saveBedMealRecord);

  //互换床位
  app.route('/v2/change_bed').post(
    authFilter.requireUser,
    hospitalizedInfoFilter.requireHospitalizedInfo,
    bedFilter.requireBed,
    bedMealRecordController.changeBed);
};
