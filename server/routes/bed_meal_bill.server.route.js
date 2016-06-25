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

  //护士批量生成用餐订单
  app.route('/bed_meal_bills/batch').post(authFilter.requireUser,
    bedMealRecordFilter.requireMealRecords,
    goodsFilter.requireAllHealthyMeals,
    bedFilter.requireBuilding,
    bedFilter.requireFloor,
    bedMealBillController.batchCreateBills);

  //食堂人员选餐
  app.route('/bed_meal_bills').post(authFilter.requireClient,
    goodsFilter.requireAllHealthyMeals,
    bedFilter.requireBuilding,
    bedFilter.requireFloor,
    bedMealBillController.chooseGoodsBill);

  //根据状态获取账单列表（un_paid,paid）没有状态就返回所有
  app.route('/bed_meal_bills').get(authFilter.requireUser,
    hospitalizedInfoFilter.requireHospitalizedInfoWithPopulation,
    paginationFilter.requirePagination,
    bedMealBillController.queryBedMealBillsByFilter);

  //根据入住信息来结算
  app.route('/bed_meal_bills/checkout').post(authFilter.requireUser,
    hospitalizedInfoFilter.requireHospitalizedInfo,
    bedMealBillController.checkoutByHospitalizedInfoId);


};
