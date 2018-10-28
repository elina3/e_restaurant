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

  app.route('/cards_list').get(authFilter.requireUser, cardController.getCardList);

  //新增饭卡信息导出功能：根据条件筛选和用户角色所有饭卡结果
  app.route('/cards_list/export_all_by_filter').get(authFilter.requireUser, cardController.exportAllCardsByFilter);

  app.route('/client/card').get(cardFilter.requireCardByIDNumberOrCardNumber, cardController.getCardDetail);

  app.route('/cards_history_list').get(authFilter.requireUser, cardController.getCardHistories);
  app.route('/card/statistics').get(authFilter.requireUser, cardController.getCardStatistics);
  //饭卡金额数量财务统计
  app.route('/card/amount_count_statistics').get(authFilter.requireUser, cardController.exportCardStatistic);

  app.route('/cards/import').post(authFilter.requireUser, cardController.importCards);
  //卡内余额
  app.route('/card/balance').get(authFilter.requireUser, cardController.getCardBalance);
  app.route('/card/recharge/batch').post(authFilter.requireUser, cardController.batchRechargeCard);

  app.route('/card/test').get(cardController.getStatisticByHistory);

  //删除脏数据
  app.route('/card/delete_pay').post(authFilter.requireUser, cardController.deleteCardPay);

  app.route('/card/change_password').post(authFilter.requireUser, cardFilter.requireCard, cardController.changeCardPassword);
};
