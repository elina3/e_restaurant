/**
 * Created by elinaguo on 16/6/12.
 */
'use strict';
var bedController = require('../controllers/bed');
var authFilter = require('../filters/auth');

module.exports = function (app) {
  app.route('/bed/buildings').get(authFilter.requireUser, bedController.getBuildings);
  app.route('/bed/floors').get(authFilter.requireUser, bedController.getFloorsByBuildingId);
  app.route('/bed/list').get(authFilter.requireUser, bedController.getBedsByFloorId);
};
