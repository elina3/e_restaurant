/**
 * Created by elinaguo on 16/6/14.
 */
'use strict';
var bedMealRecordController = require('../controllers/bed_meal_record');
var authFilter = require('../filters/auth'),
  bedFilter = require('../filters/bed'),
  hospitalizedInfoFilter = require('../filters/hospitalized_info');

module.exports = function (app) {
  //根据楼层获取病床营养餐设置信息
  app.route('/bed_meal_records').get(authFilter.requireUser,
    bedFilter.requireBuilding,
    bedFilter.requireFloor,
    bedMealRecordController.getBedMealRecords);

  //根据楼层获取当天某一餐的病床普食设置信息
  app.route('/bed_meal_records/today_healthy_normal').get(authFilter.requireClient,
    bedFilter.requireBuilding,
    bedFilter.requireFloor,
    bedMealRecordController.getHealthyNormalBedMealRecordByFloorToday);

  //根据楼层
  app.route('/bed_meal_records').post(authFilter.requireUser,
    bedFilter.requireBuilding,
    bedFilter.requireFloor,
    bedMealRecordController.saveBedMealRecords);

};
