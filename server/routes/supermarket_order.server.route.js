'use strict';

var supermarketOrderController = require('../controllers/supermarket_order');
var authFilter = require('../filters/auth');
var cardFilter = require('../filters/card');
var paginationFilter = require('../filters/pagination');

module.exports = function (app) {
  app.route('/client/supermarket_order/create_and_pay').post(authFilter.requireClient, cardFilter.requireCard, supermarketOrderController.generateOrder);
  // app.route('/user/supermarket_orders').get(authFilter.requireUser, paginationFilter.requirePagination, supermarketOrderController.getSupermarketOrdersByPagination);
  app.route('/user/supermarket_orders').get(paginationFilter.requirePagination, supermarketOrderController.getSupermarketOrdersByPagination);
};