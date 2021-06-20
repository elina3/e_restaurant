'use strict';

var milkOrderController = require('../controllers/milk_order');
var authFilter = require('../filters/auth');
var cardFilter = require('../filters/card');
var paginationFilter = require('../filters/pagination');

module.exports = function (app) {
  app.route('/client/milk_order/create_and_pay').post(authFilter.requireClient, cardFilter.requireCard, milkOrderController.generateOrder);
  // app.route('/user/milk_orders').get(authFilter.requireUser, paginationFilter.requirePagination, milkOrderController.getMilkOrdersByPagination);
  app.route('/user/milk_orders').get(paginationFilter.requirePagination, milkOrderController.getMilkOrdersByPagination);
};