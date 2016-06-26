/**
 * Created by elinaguo on 16/6/12.
 */
'use strict';
var bedController = require('../controllers/bed');
var authFilter = require('../filters/auth');

module.exports = function (app) {
  app.route('/bed/buildings').get(authFilter.requireUser, bedController.getBuildingsByUser);

  app.route('/bed/buildings/without_filter').get(bedController.getBuildings);
  app.route('/bed/floors').get(bedController.getFloorsByBuildingId);
  app.route('/bed/list').get(bedController.getBedsByFloorId);
};
