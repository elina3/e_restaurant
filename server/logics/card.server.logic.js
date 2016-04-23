/**
 * Created by elinaguo on 16/2/23.
 */
'use strict';
var mongooseLib = require('../libraries/mongoose');
var appDb = mongooseLib.appDb;
var Card = appDb.model('Card');

var systemError = require('../errors/system');
var cardError = require('../errors/card');

exports.addCard = function(cardInfo,  callback){
  if(!cardInfo.card_number){
    return callback({err: cardError.card_number_null});
  }

  //if(!cardInfo.money || cardInfo.money < 0){
  //  return callback({err: cardError.card_money_null});
  //}

  Card.findOne({card_number: cardInfo.card_number}).exec(function(err, card){
    if(err){
      return callback({err: systemError.database_query_error});
    }

    if(card){
      return callback({err: cardError.card_exist});
    }

    card = new Card({
      card_number: cardInfo.card_number,
      status: 'disabled',
      money: cardInfo.money,
    });
    card.save(function(err, newCard){
      if(err || !newCard){
        return callback({err: systemError.database_save_error});
      }

      return callback(null, newCard);
    });
  });
};

function getCardDetailById(cardId, callback){
  Card.findOne({_id: cardId})
    .exec(function(err, card){
      if(err){
        return callback({err: systemError.internal_system_error});
      }

      if(!card){
        return callback({err: systemError.card_not_exist});
      }


      return callback(null, card);
    });
}

exports.getCardByNumber = function(cardNumber, callback){
  Card.findOne({card_number: cardNumber})
    .exec(function(err, card){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      return callback(null, card);
    });
};

exports.getCardById = function(cardId, callback){
  getCardDetailById(cardId, function(err, card){
    return callback(err, card);
  });
};

exports.updateCardById = function(cardId, cardInfo, callback){
  var status='disabled';
  if(!cardId){
    return callback({err: cardError.card_id_null});
  }

  if(!cardInfo.card_number){
    return callback({err: cardError.card_number_null});
  }

  if(cardInfo.money<0){
    return callback({err: cardError.card_money_negative});
  }
  else if(cardInfo.money>0){
    status='enabled';
  }

  getCardDetailById(cardId, function(err, card){
    if(err){
      return callback(err);
    }

    Card.update({_id: cardId},{$set: {card_number: cardInfo.card_number,
      registration_number: cardInfo.registration_number, money:cardInfo.money, status:status
    }}, function(err){
      if(err){
        return callback({err: systemError.internal_system_error});
      }

      return callback(null, true);
    });
  });
};

exports.deleteCard = function(cardId, callback){
  Card.findOne({_id: cardId}, function(err, card){
    if(err){
      return callback({err: systemError.database_query_error});
    }

    if(!card){
      return callback({err: cardError.card_not_exist});
    }

    if(card.deleted_status){
      return callback({err: cardError.card_deleted});
    }

    card.deleted_status = true;
    card.save(function(err, newCard){
      if(err || !newCard){
        return callback({err: systemError.database_save_error});
      }

      return callback(null, newCard);
    });
  });
};

exports.getCardList = function(currentPage, limit, skipCount,keyword, callback){

  var query;
  if(!keyword)
    query = {
      deleted_status: false
    };
  else query={
    deleted_status:false,
    card_number:new RegExp(keyword)
  };
  Card.count(query, function(err, totalCount){
    if(err){
      return callback({err: systemError.internal_system_error});
    }

    if (limit === -1) {
      limit = totalCount;
    }

    if (skipCount === -1) {
      skipCount = limit * (currentPage - 1);
    }

    Card.find(query)
      .sort({update_time: -1})
      .skip(skipCount)
      .limit(limit)
      .exec(function(err, cardList){
        if(err){
          return callback({err: systemError.internal_system_error});
        }

        return callback(null, {
          totalCount: totalCount,
          limit: limit,
          cardList: cardList
        });
      });
  });
};

exports.pay = function(card, amount, callback){
  if(amount <= 0){
    return callback(null, card);
  }

  if(card.money < amount){
    return callback({err: cardError.insufficient_balance});
  }

  if(card.status === 'disabled'){
    return callback({err: cardError.card_disabled});
  }

  card.money =card.money - amount;
  card.save(function(err, newCard){
    if(err || !newCard){
      return callback({err: systemError.database_save_error});
    }
    return callback(null, newCard);
  });
}

