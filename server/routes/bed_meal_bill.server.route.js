/**
 * Created by elinaguo on 16/6/25.
 */
'use strict';

var bedMealBillController = require('../controllers/bed_meal_bill');
var authFilter = require('../filters/auth'),
  bedFilter = require('../filters/bed'),
  goodsFilter = require('../filters/goods'),
  hospitalizedInfoFilter = require('../filters/hospitalized_info'),
  bedMealRecordFilter = require('../filters/bed_meal_record'),
  paginationFilter = require('../filters/pagination');

module.exports = function (app) {

  //护士批量生成账单
  app.route('/bed_meal_bills/batch').post(authFilter.requireUser,
    bedMealRecordFilter.requireMealRecords,
    goodsFilter.requireAllHealthyMeals,
    bedFilter.requireBuilding,
    bedFilter.requireFloor,
    bedMealBillController.batchCreateBills);

  //食堂人员选餐，产生账单
  app.route('/bed_meal_bills/single').post(authFilter.requireClient,
    goodsFilter.requireAllHealthyMeals,
    bedFilter.requireBuilding,
    bedFilter.requireFloor,
    bedMealBillController.chooseGoodsBill);

  //根据时间段，账单状态或身份证号查询账单（时间段必选）
  app.route('/bed_meal_bills').get(authFilter.requireUser, paginationFilter.requirePagination, bedMealBillController.queryBedMealBillsByFilter);
  //根据时间短，账单状态或身份证号统计账单金额（时间段必选）
  app.route('/bed_meal_bills/amount_statistic').get(authFilter.requireUser, paginationFilter.requirePagination, bedMealBillController.getBedMealBillStatistic);

  //登录人员，根据状态获取账单列表（un_paid,paid）没有状态就返回所有
  app.route('/hospitalized_info/bed_meal_bills').get(authFilter.requireUser,
    hospitalizedInfoFilter.requireHospitalizedInfoWithPopulation,
    paginationFilter.requirePagination,
    bedMealBillController.querySickerBedMealBillsByFilter);

  //根据入住信息来结算
  app.route('/hospitalized_info/bed_meal_bills/checkout').post(authFilter.requireUser,
    hospitalizedInfoFilter.requireHospitalizedInfo,
    bedMealBillController.checkoutByHospitalizedInfoId);


};
