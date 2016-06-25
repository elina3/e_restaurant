/**
 * Created by elinaguo on 16/6/14.
 */
'use strict';
var bedMealRecordController = require('../controllers/bed_meal_record');
var authFilter = require('../filters/auth'),
  bedFilter = require('../filters/bed'),
  hospitalizedInfoFilter = require('../filters/hospitalized_info');

module.exports = function (app) {
  app.route('/bed_meal_records').get(authFilter.requireUser, bedFilter.requireBuilding, bedFilter.requireFloor, bedMealRecordController.getBedMealRecords);
  app.route('/bed_meal_records').post(authFilter.requireUser, bedFilter.requireBuilding, bedFilter.requireFloor,  hospitalizedInfoFilter.requireHospitalizedInfo, bedMealRecordController.saveBedMealRecords);
};
