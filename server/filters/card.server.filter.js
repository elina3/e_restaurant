/**
 * Created by elinaguo on 16/4/17.
 */
'use strict';
var cardError = require('../errors/card');
var cardLogic = require('../logics/card');

exports.requireCard = function(req, res, next){
  var cardId = req.body.card_id || req.query.card_id || '';
  if(!cardId){
    return res.send({err: cardError.card_id_null});
  }

  cardLogic.getCardById(cardId, function(err, card){
    if(err){
      return next(err);
    }

    if(!card){
      return next({err: cardError.card_not_exist});
    }

    if(card.deleted_status){
      return next({err: cardError.card_deleted});
    }

    req.card = card;
    next();
  });
};

exports.requireCardByIDNumberOrCardNumber = function(req, res, next){
  var cardKeyword = req.body.card_keyword || req.query.card_keyword || '';

  if(!cardKeyword){
    return next({err: cardError.card_param_null});
  }

  cardLogic.findEnabledCardByCardNumberOrIdNumber(cardKeyword, function(err, card){
    if(err){
      return next(err);
    }

    req.card = card;
    next();
  });
};


exports.validCardWithPassword = function(req, res, next){
  var idNumber = req.body.id_number || req.query.id_number || '';
  var password = req.body.password || req.query.password || '';

  if(!idNumber){
    return next({err: cardError.id_number_null});
  }

  if(!password){
    return next({err: cardError.param_password_null});
  }

  cardLogic.findEnabledCardByIdNumber(idNumber, function(err, card){
    if(err){
      return next(err);
    }

    if(!card.password){
      return next({err: cardError.card_password_null});
    }

    if(!card.authenticate(password)){
      return next({err: cardError.card_password_error});
    }

    req.card = card;
    next();
  });
};
