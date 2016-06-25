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
  app.route('/bed_meal_bills/batch').post(authFilter.requireUser, bedMealRecordFilter.requireMealRecords, goodsFilter.requireAllHealthyMeals, bedFilter.requireBuilding, bedFilter.requireFloor, bedMealBillController.batchCreateBills);
  app.route('/bed_meal_bills').post(authFilter.requireUser, goodsFilter.requireAllHealthyMeals, bedFilter.requireBuilding, bedFilter.requireFloor, bedMealBillController.batchCreateBills);
  app.route('/bed_meal_bills').get(authFilter.requireUser, hospitalizedInfoFilter.requireHospitalizedInfoWithPopulation, paginationFilter.requirePagination, bedMealBillController.queryBedMealBillsByFilter);
  app.route('/bed_meal_bills/checkout').post(authFilter.requireUser, hospitalizedInfoFilter.requireHospitalizedInfo, bedMealBillController.checkoutByHospitalizedInfoId);
};
