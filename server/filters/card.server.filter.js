/**
 * Created by elinaguo on 16/4/17.
 */
'use strict';
var cardError = require('../errors/card');
var cardLogic = require('../logics/card');

exports.requireCard = function(req, res, next){
  var cardNumber = req.body.card_number || req.query.card_number || '';


  if(!cardNumber){
    return res.send({err: cardError.card_number_null})
  }

  cardLogic.getCardByNumber(cardNumber, function(err, card){
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
