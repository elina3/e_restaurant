/**
 * Created by elinaguo on 16/6/25.
 */
'use strict';

var hospitalizedInfoController = require('../controllers/hospitalized_info');
var authFilter = require('../filters/auth'),
  bedFilter = require('../filters/bed'),
  hospitalizedInfoFilter = require('../filters/hospitalized_info');

module.exports = function (app) {
  app.route('/hospitalized_info').post(authFilter.requireUser, bedFilter.requireBuilding, bedFilter.requireFloor, bedFilter.requireBed, hospitalizedInfoController.addNewHospitalizedInfo);
  app.route('/hospitalized_info').get(authFilter.requireUser, hospitalizedInfoFilter.requireHospitalizedInfo, hospitalizedInfoController.queryHospitalizedInfoByFilter);
  app.route('/hospitalized_info/leaveHospital').post(authFilter.requireUser, hospitalizedInfoFilter.requireHospitalizedInfo, hospitalizedInfoController.leaveHospital);
  app.route('/hospitalized_info/add_description').post(authFilter.requireUser, hospitalizedInfoFilter.requireHospitalizedInfo, hospitalizedInfoController.addLeaveDescription);
};
