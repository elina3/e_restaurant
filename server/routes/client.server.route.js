/**
 * Created by elinaguo on 16/4/17.
 */
'use strict';

var clientController = require('../controllers/client');
var authFilter = require('../filters/auth');
var goodsFilter = require('../filters/goods');

module.exports = function (app) {
  app.route('/client').post(clientController.signUp);
  app.route('/client').get(clientController.getClientDetail);
  app.route('/client/modify').post(clientController.modifyClient);
  app.route('/client/delete').post(authFilter.requireAdmin,clientController.deleteClient);
  app.route('/client/list').get(authFilter.requireAdmin, clientController.getClients);


  app.route('/client/personal_sign_in').post(clientController.personalSignIn);

  app.route('/client/sign_in').post(clientController.signIn);
  app.route('/client/cart/add').post(authFilter.requireClient, goodsFilter.requireGoods, clientController.addGoodsToCart);
  app.route('/client/cart/update').post(authFilter.requireClient, goodsFilter.requireGoods, clientController.updateGoodsToCart);
  app.route('/client/cart/remove').post(authFilter.requireClient, goodsFilter.requireGoods, clientController.removeGoodsFromCart);
};
