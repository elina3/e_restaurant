/**
 * Created by elinaguo on 16/2/22.
 */
'use strict';
var cardLogic = require('../logics/card');
exports.addNewCard = function (req, res, next) {
  var user = req.user;
  var cardInfo = req.body.card_info || req.query.card_info || {};
  cardLogic.addCard(user, cardInfo, function (err, card) {
    if (err) {
      return next(err);
    }

    req.data = {
      card: card
    };
    return next();
  });
};

exports.updateCard = function (req, res, next) {
  var card = req.card;
  var user = req.user;
  var cardInfo = req.body.card_info || req.query.card_info || {};
  cardLogic.updateCardInfo(user, card, cardInfo, function (err, card) {
    if (err) {
      req.err = err;
      return next();
    }

    req.data = {
      success: card ? true : false
    };
    return next();
  });
};

exports.getCardDetail = function (req, res, next) {
  req.data = {
    card: req.card
  };
  return next();
};

exports.deleteCard = function (req, res, next) {
  var user = req.user;
  var card = req.card;
  cardLogic.deleteCard(user, card, function (err, success) {
    if (err) {
      req.err = err;
      return next();
    }

    req.data = {
      success: success
    };
    return next();
  });
};

exports.getCardList = function (req, res, next) {
  var currentPage = req.query.current_page || req.body.current_page || 1;
  var limit = req.query.limit || req.body.limit || -1;
  var skipCount = req.query.skip_count || req.body.skip_count || -1;
  var cardNumber = req.query.card_number || req.body.card_number || '';
  var idNumber = req.query.id_number || req.body.id_number || '';
  cardLogic.getCardList(currentPage, limit, skipCount, cardNumber, idNumber, function (err, result) {
    if (err) {
      req.err = err;
      return next();
    }

    req.data = {
      card_list: result.cardList,
      total_count: result.totalCount,
      limit: result.limit
    };
    return next();
  });
};

//退卡
exports.closeCard = function (req, res, next) {
  var card = req.card;
  var user = req.user;
  cardLogic.closeCard(user, card, function (err, newCard) {
    if (err) {
      return next(err);
    }

    req.data = {
      success: newCard ? true : false
    };
    return next();
  });

};
//挂失
exports.freezeCard = function (req, res, next) {
  var card = req.card;
  var user = req.user;
  cardLogic.changeCardStatus(user, card, 'frozen', function (err, newCard) {
    if (err) {
      return next(err);
    }

    req.data = {
      success: newCard ? true : false
    };
    return next();
  });
};
//取消挂失
exports.cancelFreezeCard = function (req, res, next) {
  var card = req.card;
  var user = req.user;
  cardLogic.changeCardStatus(user, card, 'enabled', function (err, newCard) {
    if (err) {
      return next(err);
    }

    req.data = {
      success: newCard ? true : false
    };
    return next();
  });
};

//补卡
exports.replaceCard = function (req, res, next) {
  var card = req.card;
  var user = req.user;
  var newCardNumber = req.body.new_card_number || req.query.new_card_number || '';
  cardLogic.replaceCard(user, card, newCardNumber, function (err, newCard) {
    if (err) {
      return next(err);
    }

    req.data = {
      success: newCard ? true : false
    };
    return next();
  });
};
