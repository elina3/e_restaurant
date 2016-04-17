/**
 * Created by elinaguo on 16/2/22.
 */
'use strict';

var goodsController = require('../controllers/goods');
var authFilter = require('../filters/auth');

module.exports = function (app) {
  app.route('/goods').post(authFilter.requireUser, goodsController.addNewGoods);
  app.route('/goods').get(authFilter.requireUser, goodsController.getGoodsDetail);
  app.route('/goods/update').post(authFilter.requireUser, goodsController.updateGoods);
  app.route('/goods/delete').post(authFilter.requireUser, goodsController.deleteGoods);

  app.route('/goods_list').get(authFilter.requireUser, goodsController.getGoodsList);


  app.route('/client/goods/list').get(goodsController.getGoodsList);
};
