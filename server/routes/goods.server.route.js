/**
 * Created by elinaguo on 16/2/22.
 */
'use strict';

var goodsController = require('../controllers/goods');

module.exports = function (app) {
  app.route('/goods').post(goodsController.addNewGoods);
  app.route('/goods').get(goodsController.getGoodsDetail);
  app.route('/goods').put(goodsController.updateGoods);
  app.route('/goods').delete(goodsController.deleteGoods);
};
