/**
 * Created by elinaguo on 16/4/17.
 */
'use strict';

var clientController = require('../controllers/client');
var authFilter = require('../filters/auth');
var goodsFilter = require('../filters/goods');

module.exports = function (app) {
  app.route('/client/cart/add').post(authFilter.requireClient, goodsFilter.requireGoods, clientController.addGoodsToCart);
  app.route('/client/cart/remove').post(authFilter.requireClient, goodsFilter.requireGoods, clientController.removeGoodsFromCart);
};
