/**
 * Created by elinaguo on 16/2/22.
 */
'use strict';

var cardController = require('../controllers/card');
var authFilter = require('../filters/auth');
var cardFilter = require('../filters/card');

module.exports = function (app) {
  app.route('/card').post(authFilter.requireUser, cardController.addNewCard);
  app.route('/card').get(cardFilter.requireCard, cardController.getCardDetail);
  app.route('/card/modify').post(authFilter.requireUser, cardFilter.requireCard, cardController.updateCard);
  app.route('/card/delete').post(authFilter.requireUser, cardFilter.requireCard, cardController.deleteCard);

  app.route('/card/close').post(authFilter.requireUser, cardFilter.requireCard, cardController.closeCard);
  app.route('/card/freeze').post(authFilter.requireUser, cardFilter.requireCard, cardController.freezeCard);
  app.route('/card/cancel_freeze').post(authFilter.requireUser, cardFilter.requireCard, cardController.cancelFreezeCard);
  app.route('/card/replace').post(authFilter.requireUser, cardFilter.requireCard, cardController.replaceCard);

  app.route('/cards_list').get(cardController.getCardList);
  app.route('/client/card').get(cardFilter.requireCardByIDNumberOrCardNumber, cardController.getCardDetail);
};
