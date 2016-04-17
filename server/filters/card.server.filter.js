/**
 * Created by elinaguo on 16/4/17.
 */
'use strict';
var cardError = require('../errors/card');
var cardLogic = require('../logics/card');

exports.requireCard = function(req, res, next){
  var cardId;
  cardId = req.body.card_id || req.query.card_id || '';


  if(!cardId){
    return res.send({err: cardError.card_id_null})
  }

  cardLogic.getCardById(cardId, function(err, card){
    if(err){
      return next(err);
    }

    if(!card){
      return next({err: cardError.card_not_exist});
    }

    req.card = card;
    next();
  });
};
