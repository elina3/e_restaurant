/**
 * Created by elinaguo on 16/2/22.
 */
'use strict';

var cardController = require('../controllers/card');

module.exports = function (app) {
  app.route('/card').post(cardController.addNewCard);
  app.route('/card').get(cardController.getCardDetail);
  app.route('/card/modify').post(cardController.updateCard);
  app.route('/card/delete').post(cardController.deleteCard);

  app.route('/cards_list').get(cardController.getCardList);
};
