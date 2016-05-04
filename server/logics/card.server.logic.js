/**
 * Created by elinaguo on 16/2/23.
 */
'use strict';
var mongooseLib = require('../libraries/mongoose');
var publicLib = require('../libraries/public');
var businessEnum = require('../enums/business');
var appDb = mongooseLib.appDb;
var CardHistory = appDb.model('CardHistory');
var Card = appDb.model('Card');

var systemError = require('../errors/system');
var cardError = require('../errors/card');

function addHistory(user, oldCard, newCard, actionName, amount, newAmount, description, callback){
  var cardHistory = new CardHistory({
    create_user: user? user._id:null,
    card: oldCard._id,
    id_number: oldCard.id_number,
    card_number: oldCard.card_number,
    action: actionName,
    amount: amount,
    new_amount: newAmount,
    description: description
  });
  if(newCard){
    cardHistory.new_card = newCard._id;
    cardHistory.new_card_number = newCard.card_number;
  }
  cardHistory.save(function(err, newCardHistory){
    if(err || !newCardHistory){
      return callback({err: systemError.database_save_error});
    }

    return callback(null, newCardHistory);
  });
}

exports.addCard = function(user, cardInfo,  callback){
  if(!cardInfo.card_number){
    return callback({err: cardError.card_number_null});
  }

  if(!cardInfo.id_number){
    return callback({err: cardError.id_number_null});
  }

  var amount = publicLib.amountParse(cardInfo.amount);
  if(amount < 0){
    return callback({err: cardError.wrong_amount});
  }

  Card.findOne({card_number: cardInfo.card_number, deleted_status: false})
    .exec(function(err, card){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      if(card){
        return callback({err: cardError.card_number_exist});
      }

      Card.findOne({id_number: cardInfo.id_number, deleted_status: false})
        .exec(function(err, card){
          if(err){
            return callback({err: systemError.database_query_error});
          }

          if(card){
            return callback({err: cardError.id_number_exist});
          }

          if(!card){
            card = new Card({
              id_number: cardInfo.id_number,
              card_number: cardInfo.card_number,
              create_user: user._id
            });
          }

          card.type = !cardInfo.type ? 'normal' : cardInfo.type;
          card.discount = card.type === 'staff' ? 0.25 : 1;
          card.amount = amount;
          card.status = 'enabled';
          card.deleted_status = false;
          card.recent_modify_user = user._id;

          card.save(function(err, newCard){
            if(err || !newCard){
              return callback({err: systemError.database_save_error});
            }

            addHistory(user, newCard, null, 'create', amount, amount, '注册新卡', function(err, history){
              if(err){
                err.zh_message += '添加新卡注册历史记录失败！';
                return callback({err: systemError.database_save_error});
              }

              return callback(null, newCard);
            });
          });
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

exports.getCardByNumberWithoutDeleted = function(cardNumber, callback){
  Card.findOne({card_number: cardNumber, deleted_status: false})
    .exec(function(err, card){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      return callback(null, card);
    });
};
exports.getCardByIDNumberWithoutDeleted = function(idNumber, callback){
  Card.findOne({id_number: idNumber, deleted_status: false})
    .exec(function(err, card){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      return callback(null, card);
    });
};

exports.findEnabledCardByCardNumberOrIdNumber = function(cardKeyword, callback){
  var query = {
    deleted_status: false,
    $or: [{card_number: cardKeyword},{id_number: cardKeyword}]
  };

  Card.find(query, function(err, cards){
    if(err){
      return callback({err: systemError.database_query_error});
    }

    if(!cards || cards.length === 0){
      return callback({err: cardError.card_not_exist});
    }

    var enabledCard = null;
    cards.forEach(function(card){
      if(card.status === 'enabled'){
        enabledCard = card;
      }
    });

    if(!enabledCard){
      return callback({err: cardError.card_disabled});
    }

    return callback(null, enabledCard);

  });
};
exports.getCardById = function(cardId, callback){
  getCardDetailById(cardId, function(err, card){
    return callback(err, card);
  });
};

exports.updateCardInfo = function(user, card, cardInfo, callback){
  if(!cardInfo.card_number){
    return callback({err: cardError.card_number_null});
  }

  var amount = publicLib.amountParse(cardInfo.amount);
  if(amount < 0){
    return callback({err: cardError.wrong_amount});
  }

  var oldAmount = card.amount;
  var newAmount = amount;

  card.amount = amount;
  card.recent_modify_user = user._id;
  card.save(function(err, newCard){
    if(err || !newCard){
      return callback({err: systemError.database_save_error});
    }

    addHistory(user, newCard, null, 'recharge', oldAmount, newAmount, '充值', function(err, history){
      if(err){
        err.zh_message += '添加充值历史记录失败！';
        return callback({err: systemError.database_save_error});
      }

      return callback(null, newCard);
    });
  });
};

exports.deleteCard = function(user, card, callback){
  if(!card){
    return callback({err: cardError.card_not_exist});
  }

  if(card.deleted_status){
    return callback({err: cardError.card_deleted});
  }

  card.deleted_status = true;
  card.recent_modify_user = user._id;
  card.save(function(err, newCard){
    if(err || !newCard){
      return callback({err: systemError.database_save_error});
    }
    addHistory(user, newCard, null, 'delete', card.amount, card.amount, '删除卡', function(err, history){
      if(err){
        err.zh_message += '添加删除卡历史记录失败！';
        return callback({err: systemError.database_save_error});
      }

      return callback(null, newCard);
    });
  });
};

exports.getCardList = function(currentPage, limit, skipCount, cardNumber, idNumber, callback){
  var query = {
    deleted_status: false
  };
  if(cardNumber)
    query.card_number = {$regex: cardNumber, $options: '$i'};

  if(idNumber)
    query.id_number = {$regex: idNumber, $options: '$i'};

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

exports.pay = function(card, amountString, callback){
  if(card.deleted_status){
    return callback({err: cardError.card_deleted});
  }

  if(card.status !== 'enabled'){
    return callback({err: cardError['card_'+ card.status]});
  }

  var amount = publicLib.amountParse(amountString);
  if(amount < 0){
    return callback({err: cardError.wrong_amount});
  }

  if(card.amount < amount){
    return callback({err: cardError.insufficient_balance});
  }

  var oldAmount = card.amount;
  card.amount = card.amount - amount;
  card.save(function(err, newCard){
    if(err || !newCard){
      return callback({err: systemError.database_save_error});
    }

    addHistory(null, newCard, null, 'pay', oldAmount, newCard.amount, '消费', function(err, history){
      if(err){
        err.zh_message += '添加消费历史记录失败！';
        return callback({err: systemError.database_save_error});
      }

      return callback(null, newCard);
    });
  });
};

exports.changeCardStatus = function(user, card, status, callback){
  card.status = status;
  card.save(function(err, newCard){
    if(err || !newCard){
      return callback({err: systemError.database_save_error});
    }

    addHistory(user, newCard, null, 'change_status', card.amount, newCard.amount, '变更卡状态为：'+status, function(err, history){
      if(err){
        err.zh_message += '添加变更卡状态历史记录失败！';
        return callback({err: systemError.database_save_error});
      }

      return callback(null, newCard);
    });
  });
};

exports.closeCard = function(user, card, callback){
  var oldAmount = card.amount;
  card.status = 'close';
  card.deleted_status = true;
  card.amount = 0;
  card.save(function(err, newCard){
    if(err || !newCard){
      return callback({err: systemError.database_save_error});
    }

    addHistory(user, newCard, null, 'close', oldAmount, 0, '退卡', function(err, history){
      if(err){
        err.zh_message += '添加退卡历史记录失败！';
        return callback({err: systemError.database_save_error});
      }

      return callback(null, newCard);
    });
  });
};

exports.replaceCard  = function(user, card, newCardNumber, callback){
  if(!newCardNumber){
    return callback({err: cardError.card_number_null});
  }

  if(card.card_number === newCardNumber){
    return callback({err: cardError.need_new_card_number});
  }

  Card.findOne({card_number: newCardNumber, deleted_status: false})
    .exec(function(err, findCard){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      if(findCard){
        return callback({err: cardError['card_' + findCard.status]});
      }

      var newCard = new Card({
        card_number: newCardNumber,
        id_number: card.id_number,
        status: 'enabled',
        amount: card.amount,
        deleted_status: false
      });
      newCard.save(function(err, savedCard){
        if(err || !savedCard){
          return callback({err: systemError.database_save_error});
        }

        addHistory(user, card, savedCard, 'create', 0, savedCard.amount, '补卡新卡', function(err, history){
          if(err){
            err.zh_message += '添加补卡新卡历史记录失败！';
            return callback({err: systemError.database_save_error});
          }

          card.status = 'revoked';
          card.deleted_status = true;
          card.amount = 0;
          card.save(function(err, card){
            if(err || !card){
              return callback({err: systemError.database_save_error});
            }

            addHistory(user, card, savedCard, 'replace', 0, savedCard.amount, '补卡', function(err, history){
              if(err){
                err.zh_message += '添加补卡历史记录失败！';
                return callback({err: systemError.database_save_error});
              }

              return callback(null, savedCard);
            });
          });
        });
      });
    });
};

exports.getCardHistories = function(currentPage, limit, skipCount, keyword, callback){

var query = {};
  if(keyword)
    query.$or = [{card_number: {$regex: keyword, $options: '$i'}},
      {id_number: {$regex: keyword, $options: '$i'}}];


  CardHistory.count(query, function(err, totalCount){
    if(err){
      return callback({err: systemError.internal_system_error});
    }

    if (limit === -1) {
      limit = totalCount;
    }

    if (skipCount === -1) {
      skipCount = limit * (currentPage - 1);
    }

    CardHistory.find(query)
      .sort({update_time: -1})
      .skip(skipCount)
      .limit(limit)
      .exec(function(err, cardHistories){
        if(err){
          return callback({err: systemError.internal_system_error});
        }

        return callback(null, {
          totalCount: totalCount,
          limit: limit,
          cardHistories: cardHistories
        });
      });
  });
};