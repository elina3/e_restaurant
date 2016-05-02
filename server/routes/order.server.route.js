/**
 * Created by elinaguo on 16/4/17.
 */
'use strict';

var orderController = require('../controllers/order');
var authFilter = require('../filters/auth');
var orderFilter = require('../filters/order');
var cardFilter = require('../filters/card');

module.exports = function (app) {
  app.route('/client/order').post(authFilter.requireClient, orderController.generateOrder);
  app.route('/client/order').get(authFilter.requireClient, orderFilter.requireOrderDetail, orderController.getOrderDetail);

  app.route('/client/order/pay').post(authFilter.requireClient,  orderFilter.requireOrder, cardFilter.requireCardByIDNumberOrCardNumber, orderController.payOrder);
  app.route('/client/my_orders').get(authFilter.requireClient, orderController.getMyOrders);


  app.route('/user/order').get(authFilter.requireUser, orderFilter.requireOrderDetail, orderController.getOrderDetail);
  app.route('/user/order_list').get(authFilter.requireUser, orderController.getOrders);
  app.route('/user/order/delete').post(authFilter.requireUser, orderFilter.requireOrder, orderController.deleteOrder);

  app.route('/user/order/cook').post(authFilter.requireUser, orderFilter.requireOrder, orderController.orderBeginToCook);
  app.route('/user/order/transport').post(authFilter.requireUser, orderFilter.requireOrder, orderController.orderBeginToTransport);
  app.route('/user/order/complete').post(authFilter.requireUser, orderFilter.requireOrder, orderController.orderComplete);

  app.route('/user/order/goods_cook').post(authFilter.requireUser, orderFilter.requireGoodsOrder, orderController.setGoodsOrderCooking);
  app.route('/user/order/goods_complete').post(authFilter.requireUser, orderFilter.requireGoodsOrder, orderController.setGoodsOrderComplete);

  app.route('/user/order/today_amount').get(orderController.getTodayAmount);
};
