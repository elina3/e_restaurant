/**
 * Created by elinaguo on 16/2/23.
 */
'use strict';
var mongooseLib = require('../libraries/mongoose');
var publicLib = require('../libraries/public');
var businessEnum = require('../enums/business');
var appDb = mongooseLib.appDb;
var CardHistory = appDb.model('CardHistory'),
  Card = appDb.model('Card'),
  CardStatistic = appDb.model('CardStatistic');

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

function addCardStatistic(user, card, action, amount, description, callback){
  var cardStatistic = new CardStatistic({
    create_user: user? user._id:null,
    card: card._id,
    id_number: card.id_number,
    card_number: card.card_number,
    action: action,
    amount: amount,
    description: description
  });
  cardStatistic.save(function(err, newCardStatistic){
    if(err || !newCardStatistic){
      return callback({err: systemError.database_save_error});
    }

    return callback(null, newCardStatistic);
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

          card.nickname = cardInfo.nickname;
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

  var addAmount = publicLib.amountParse(cardInfo.amount);
  if(addAmount < 0){
    return callback({err: cardError.wrong_amount});
  }

  var oldAmount = card.amount;
  var newAmount = oldAmount + addAmount;

  card.nickname = cardInfo.nickname;
  card.amount = newAmount;
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

      addCardStatistic(user, newCard, 'recharge', addAmount, '充值', function(err, result){
        return callback(err, newCard);
      });
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
    addHistory(user, newCard, null, 'delete', newCard.amount, newCard.amount, '删除卡', function(err, history){
      if(err){
        err.zh_message += '添加删除卡历史记录失败！';
        return callback({err: systemError.database_save_error});
      }

      addCardStatistic(user, newCard, 'delete', newCard.amount, '删除', function(err, result){
        return callback(err, newCard);
      });
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

function getActualAmount(card, amount, paymentStatisticThisMonth){
  if(card.type === 'normal'){
    return amount;
  }

  if(paymentStatisticThisMonth.totalAmount >= 300){
    return amount;
  }

  if(amount <= (300 - paymentStatisticThisMonth.totalAmount)){
    return amount * card.discount;
  }

  var discountMoney = 300 - paymentStatisticThisMonth.totalAmount;
  return (amount - discountMoney) + discountMoney * card.discount;
}

exports.pay = function(card, amountString, paymentStatisticThisMonth, callback){
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

  var actualAmount = getActualAmount(card, amount, paymentStatisticThisMonth);

  if(card.amount < actualAmount){
    return callback({err: cardError.insufficient_balance});
  }

  card.amount = card.amount - actualAmount;
  card.save(function(err, newCard){
    if(err || !newCard){
      return callback({err: systemError.database_save_error});
    }

    return callback(null, {
      card: newCard,
      actualAmount: actualAmount
    });
  });
};

exports.changeCardStatus = function(user, card, status, callback){
  card.status = status;
  card.save(function(err, newCard){
    if(err || !newCard){
      return callback({err: systemError.database_save_error});
    }

    addHistory(user, newCard, null, 'change_status', card.amount, newCard.amount, '变更卡状态为：' + status, function(err, history){
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

      addCardStatistic(user, newCard, 'close', oldAmount, '退卡', function(err, result){
        return callback(err, newCard);
      });
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

        addHistory(user, card, savedCard, 'recreate', 0, savedCard.amount, '补卡新卡', function(err, history){
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

exports.getCardHistories = function(currentPage, limit, skipCount, filter, callback){

var query = {};
  if(filter.keyword)
    query.$or = [{card_number: filter.keyword},
      {id_number: filter.keyword}];


  if(filter.startTime && filter.endTime){
    query.$and = [{create_time: {$gte: filter.startTime}},{create_time:{$lte: filter.endTime}}];
  }

  if(filter.action){
    query.action = filter.action;
  }

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
      .sort({create_time: -1})
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

exports.getCardStatistics = function(filter, callback){
  var query = {};
  if(filter.keyword){
      query.$or = [{card_number: filter.keyword},
        {id_number: filter.keyword}];
  }


  if(filter.startTime && filter.endTime){
    query.$and = [{create_time: {$gte: filter.startTime}},{create_time:{$lte: filter.endTime}}];
  }

  CardStatistic.aggregate([{
    $match: query
  }, {
    $group: {
      _id: '$action',
      action: {$first: '$action'},
      totalAmount: {$sum: '$amount'}
    }
  }], function(err, result){
    if(err || !result){
      return callback({err: systemError.database_query_error});
    }
    var amountResult = {
      totalRechargeAmount: 0,
      totalCloseAmount: 0,
      totalDeleteAmount: 0
    };
    if(result.length === 0){
      return callback(null, amountResult);
    }


    result.forEach(function(item){
      if(item.action === 'recharge'){
        amountResult.totalRechargeAmount = item.totalAmount;
      }
      if(item.action === 'close'){
        amountResult.totalCloseAmount = item.totalAmount;
      }
      if(item.action === 'delete'){
        amountResult.totalDeleteAmount = item.totalAmount;
      }
    });
    return callback(null, amountResult);
  });
};

exports.getTotalCardBalance = function(filter, callback){
  var query = {
    deleted_status: false,
    status: {$in: ['enabled', 'frozen']}
  };
  if(filter.keyword){
    query.$or = [{card_number: filter.keyword},
      {id_number: filter.keyword}];
  }

  Card.aggregate([{
    $match: query
  }, {
    $group: {
      _id: '$status',
      totalAmount: {$sum: '$amount'}
    }
  }], function(err, result){
    if(err || !result){
      return callback({err: systemError.database_query_error});
    }

    if(result.length === 0){
      return callback(null, 0);
    }

    var totalBalance = 0;
    result.forEach(function(item){
      totalBalance += item.totalAmount;
    });
    return callback(null, totalBalance);
  });
};

