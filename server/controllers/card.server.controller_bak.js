/**
 * Created by elinaguo on 16/2/22.
 */
'use strict';
var cardLogic = require('../logics/card');
exports.addNewCard = function(req, res, next){
  var cardInfo = req.body.card_info || req.query.card_info || {};
  //var user = req.user;
  cardLogic.addCard(cardInfo, function(err, card){
    if(err){
      return next(err);
    }

    req.data = {
      card: card
    };
    return next();
  });
};

exports.updateCard = function(req, res, next){
  var cardId = req.body.card_id || req.query.card_id || '';
  var cardInfo = req.body.card_info || req.query.card_info || {};
  cardLogic.updateCardById(cardId, cardInfo, function(err, success){
    if(err){
      req.err = err;
      return next();
    }

    req.data = {
      success: success
    };
    return next();
  });
};

exports.getCardDetail = function(req, res, next){
  var cardId = req.body.card_id || req.query.card_id || '';
  cardLogic.getCardById(cardId, function(err, card){
    if(err){
      req.err = err;
      return next();
    }

    req.data = {
      card: card
    };
    return next();
  });
};

exports.deleteCard = function(req, res, next){
  var cardId = req.body.card_id || req.query.card_id || '';
  cardLogic.deleteCard(cardId, function(err, success){
    if(err){
      req.err = err;
      return next();
    }

    req.data = {
      success: success
    };
    return next();
  });
};

exports.getCardList = function(req, res, next){
  var currentPage = req.query.current_page || req.body.current_page || 1;
  var limit = req.query.limit || req.body.limit || -1;
  var skipCount = req.query.skip_count || req.body.skip_count || -1;

  cardLogic.getCardList(currentPage, limit, skipCount, function(err, result){
    if(err){
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
