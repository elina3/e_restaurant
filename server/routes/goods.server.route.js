/**
 * Created by elinaguo on 16/2/22.
 */
'use strict';

var goodsController = require('../controllers/goods');
var authFilter = require('../filters/auth'),
  paginationFilter = require('../filters/pagination');

module.exports = function (app) {
  app.route('/goods').post(authFilter.requireUser, goodsController.addNewGoods);
  app.route('/goods').get(authFilter.requireUser, goodsController.getGoodsDetail);
  app.route('/goods/update').post(authFilter.requireUser, goodsController.updateGoods);
  app.route('/goods/delete').post(authFilter.requireUser, goodsController.deleteGoods);

  app.route('/goods_list').get(authFilter.requireUser, goodsController.getGoodsList);


  app.route('/client/goods/list').get(goodsController.getOpeningGoodsList);
  app.route('/client/goods').get(goodsController.getGoodsDetail);
  app.route('/client/goods/free_meal').get(goodsController.getFirstFreeMealGoods);

  app.route('/client/goods/healthy_normal').get(authFilter.requireClient, paginationFilter.requirePagination, goodsController.getHealthyNormalGoods);
};
