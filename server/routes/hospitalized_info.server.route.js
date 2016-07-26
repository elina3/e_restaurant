/**
 * Created by elinaguo on 16/6/25.
 */
'use strict';

var hospitalizedInfoController = require('../controllers/hospitalized_info');
var authFilter = require('../filters/auth'),
  bedFilter = require('../filters/bed'),
  hospitalizedInfoFilter = require('../filters/hospitalized_info');

module.exports = function (app) {
  app.route('/hospitalized_info').post(authFilter.requireUser,
    bedFilter.requireBuilding,
    bedFilter.requireFloor,
    bedFilter.requireBed,
    hospitalizedInfoFilter.validCanHospitalizedBed,
    hospitalizedInfoController.addNewHospitalizedInfo);

  app.route('/hospitalized_info').get(authFilter.requireUser,
    hospitalizedInfoController.queryHospitalizedInfoByIdNumber);

  app.route('/hospitalized_info/filter').get(authFilter.requireUser,
    bedFilter.requireBuilding,
    bedFilter.requireFloor,
    hospitalizedInfoController.queryHospitalizedInfoByFilter);

  app.route('/hospitalized_info/leaveHospital').post(authFilter.requireUser,
    hospitalizedInfoFilter.requireHospitalizedInfo,
    hospitalizedInfoController.leaveHospital);

  app.route('/v2/hospitalized_info/leaveHospital').post(authFilter.requireUser,
    hospitalizedInfoFilter.requireHospitalizedInfo,
    hospitalizedInfoController.leaveHospitalV2);

  app.route('/hospitalized_info/add_description').post(authFilter.requireUser, hospitalizedInfoFilter.requireHospitalizedInfo, hospitalizedInfoController.addLeaveDescription);
};
