/**
 * Created by elinaguo on 16/2/23.
 */
'use strict';
var async = require('async');
var mongooseLib = require('../libraries/mongoose');
var publicLib = require('../libraries/public');
var businessEnum = require('../enums/business');
var appDb = mongooseLib.appDb;
var CardHistory = appDb.model('CardHistory'),
  Card = appDb.model('Card'),
  CardStatistic = appDb.model('CardStatistic'),
  AutoCardRechargeHistory = appDb.model('AutoCardRechargeHistory');

var systemError = require('../errors/system');
var cardError = require('../errors/card');

function floatMinus(arg1, arg2) {
  var r1, r2, m, n;
  try {
    r1 = arg1.toString().split(".")[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split(".")[1].length;
  } catch (e) {
    r2 = 0;
  }
  m = Math.pow(10, Math.max(r1, r2));
  n = (r1 >= r2) ? r1 : r2;
  return parseFloat(((arg1 * m - arg2 * m) / m).toFixed(n));
}

function floatMul(arg1, arg2) {
  var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
  try {
    m += s1.split(".")[1].length;
  } catch (e) {
  }
  try {
    m += s2.split(".")[1].length;
  } catch (e) {
  }
  return parseFloat(Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m));
}

function floatAdd(arg1, arg2) {
  var r1, r2, m;
  try {
    r1 = arg1.toString().split(".")[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split(".")[1].length;
  } catch (e) {
    r2 = 0;
  }
  m = Math.pow(10, Math.max(r1, r2));
  return parseFloat((arg1 * m + arg2 * m) / m);
}

function addHistory(user, oldCard, newCard, actionName, amount, newAmount, description, callback, client, supermarketOrder) {
  var cardHistory = new CardHistory({
    create_client: client ? client._id : null,
    create_user: user ? user._id : null,
    card: oldCard._id,
    card_type: oldCard.type,//2021/04/30 增加卡类型荣誉
    id_number: oldCard.id_number,
    card_number: oldCard.card_number,
    card_nickname: oldCard.nickname,
    action: actionName,
    amount: amount,
    new_amount: newAmount,
    description: description
  });
  if (newCard) {
    cardHistory.new_card = newCard._id;
    cardHistory.new_card_number = newCard.card_number;
    cardHistory.new_card_nickname = newCard.nickname;
  }
  if (supermarketOrder) {
    cardHistory.supermarket_order = supermarketOrder._id;
  }
  cardHistory.save(function (err, newCardHistory) {
    if (err || !newCardHistory) {
      return callback({err: systemError.database_save_error});
    }

    return callback(null, newCardHistory);
  });
}

function addCardStatistic(user, card, action, amount, description, callback) {
  var cardStatistic = new CardStatistic({
    create_user: user ? user._id : null,
    card: card._id,
    id_number: card.id_number,
    card_type: card.type,
    card_nickname: card.nickname,
    card_number: card.card_number,
    action: action,
    amount: amount,
    description: description
  });
  cardStatistic.save(function (err, newCardStatistic) {
    if (err || !newCardStatistic) {
      return callback({err: systemError.database_save_error});
    }

    return callback(null, newCardStatistic);
  });
}

exports.addCard = function (user, cardInfo, callback) {
  if (!cardInfo.card_number) {
    return callback({err: cardError.card_number_null});
  }

  if (!cardInfo.id_number) {
    return callback({err: cardError.id_number_null});
  }

  Card.findOne({card_number: cardInfo.card_number, deleted_status: false})
    .exec(function (err, card) {
      if (err) {
        return callback({err: systemError.database_query_error});
      }

      if (card) {
        return callback({err: cardError.card_number_exist});
      }

      Card.findOne({id_number: cardInfo.id_number, deleted_status: false})
        .exec(function (err, card) {
          if (err) {
            return callback({err: systemError.database_query_error});
          }

          if (card) {
            return callback({err: cardError.id_number_exist});
          }

          if (!card) {
            card = new Card({
              id_number: cardInfo.id_number,
              card_number: cardInfo.card_number,
              create_user: user._id
            });
          }

          card.nickname = cardInfo.nickname;
          card.type = !cardInfo.type ? 'normal' : cardInfo.type;
          card.discount = card.type === 'staff' ? 1 : 1; //员工没有折扣从0.25改为1（2021／4／30）
          card.status = 'enabled';
          card.deleted_status = false;
          card.recent_modify_user = user._id;

          card.save(function (err, newCard) {
            if (err || !newCard) {
              return callback({err: systemError.database_save_error});
            }

            addHistory(user, newCard, null, 'create', 0, 0, '注册新卡', function (err, history) {
              if (err) {
                err.zh_message += '添加新卡注册历史记录失败！';
                return callback({err: systemError.database_save_error});
              }

              return callback(null, newCard);
            });
          });
        });
    });
};

exports.importStaffCards = function (user, cardList, callback) {
  var cards = [];
  var existCards = [];
  async.eachSeries(cardList,
    function (cardInfo, eachCallback) {
      if (!cardInfo.card_number) {
        return eachCallback({err: cardError.card_number_null});
      }

      if (!cardInfo.id_number) {
        return eachCallback({err: cardError.id_number_null});
      }

      Card.findOne({card_number: cardInfo.card_number})
        .exec(function (err, card) {
          if (err) {
            return eachCallback({err: systemError.database_query_error});
          }

          if (card && !card.deleted_status) {
            existCards.push(card);
            return eachCallback();
          }

          Card.findOne({id_number: cardInfo.id_number})
            .exec(function (err, card) {
              if (err) {
                return eachCallback({err: systemError.database_query_error});
              }

              if (card && !card.deleted_status) {
                existCards.push(card);
                return eachCallback();
              }

              if (!card) {
                card = new Card({
                  id_number: cardInfo.id_number,
                  card_number: cardInfo.card_number,
                  create_user: user._id,
                  amount: 0,
                  type: 'staff',
                  discount: 1 //员工折扣改为1（2021／4／30）
                });
              }

              card.nickname = cardInfo.nickname;
              card.status = 'enabled';
              card.deleted_status = false;
              card.recent_modify_user = user._id;
              card.save(function (err, newCard) {
                if (err || !newCard) {
                  return eachCallback({err: systemError.database_save_error});
                }

                addHistory(user, newCard, null, 'create', 0, 0, '注册新卡', function (err, history) {
                  if (err) {
                    err.zh_message += '添加新卡注册历史记录失败！';
                    return eachCallback({err: systemError.database_save_error});
                  }

                  cards.push(newCard);
                  return eachCallback(null, newCard);
                });
              });
            });
        });

    }, function (err) {
      return callback(err, {
        cards: cards,
        existCards: existCards
      });
    });
};

function getCardDetailById(cardId, callback) {
  Card.findOne({_id: cardId})
    .exec(function (err, card) {
      if (err) {
        return callback({err: systemError.internal_system_error});
      }

      if (!card) {
        return callback({err: systemError.card_not_exist});
      }

      return callback(null, card);
    });
}

exports.getCardByNumberWithoutDeleted = function (cardNumber, callback) {
  Card.findOne({card_number: cardNumber, deleted_status: false})
    .exec(function (err, card) {
      if (err) {
        return callback({err: systemError.database_query_error});
      }

      return callback(null, card);
    });
};
exports.getCardByIDNumberWithoutDeleted = function (idNumber, callback) {
  Card.findOne({id_number: idNumber, deleted_status: false})
    .exec(function (err, card) {
      if (err) {
        return callback({err: systemError.database_query_error});
      }

      return callback(null, card);
    });
};

exports.findEnabledCardByIdNumber = function (idNumber, callback) {
  var query = {
    deleted_status: false,
    id_number: idNumber
  };

  Card.find(query, function (err, cards) {
    if (err) {
      return callback({err: systemError.database_query_error});
    }

    if (!cards || cards.length === 0) {
      return callback({err: cardError.card_not_exist});
    }

    var enabledCard = null;
    cards.forEach(function (card) {
      if (card.status === 'enabled') {
        enabledCard = card;
      }
    });

    if (!enabledCard) {
      return callback({err: cardError.card_disabled});
    }

    return callback(null, enabledCard);
  });
};

exports.findEnabledCardByCardNumberOrIdNumber = function (cardKeyword, callback) {
  var query = {
    deleted_status: false,
    $or: [{card_number: cardKeyword}, {id_number: cardKeyword}]
  };

  Card.find(query, function (err, cards) {
    if (err) {
      return callback({err: systemError.database_query_error});
    }

    if (!cards || cards.length === 0) {
      return callback({err: cardError.card_not_exist});
    }

    var enabledCard = null;
    cards.forEach(function (card) {
      if (card.status === 'enabled') {
        enabledCard = card;
      }
    });

    if (!enabledCard) {
      return callback({err: cardError.card_disabled});
    }

    return callback(null, enabledCard);

  });
};
exports.getCardById = function (cardId, callback) {
  getCardDetailById(cardId, function (err, card) {
    return callback(err, card);
  });
};

const STAFFBALANCELIMIT = 1000;
const EXPERTBALANCELIMIT = 500;
exports.updateCardInfo = function (user, card, cardInfo, callback) {
  if (!cardInfo.card_number) {
    return callback({err: cardError.card_number_null});
  }

  var addAmount = publicLib.parseFloatNumber(cardInfo.amount);
  if (addAmount === null) {
    return callback({err: cardError.wrong_amount});
  }

  var oldAmount = card.amount;
  var newAmount = floatAdd(parseFloat(oldAmount.toFixed(3)), parseFloat(addAmount.toFixed(3)));

  //充值时增加限制：员工卡余额不得超过1000，专家卡余额不得超过500（2021／4／30）
  if(card.type === 'staff' && newAmount > STAFFBALANCELIMIT){//单个充值，员工卡余额不得超过1000
    return callback({err: cardError.staff_card_over_balance_limit_1000});
  }
  if(card.type === 'expert' && newAmount > EXPERTBALANCELIMIT){//单个充值，专家卡余额不得超过500
    return callback({err: cardError.expert_card_over_balance_limit_500});
  }

  card.nickname = cardInfo.nickname;
  card.recent_recharge_type = cardInfo.recharge_type || 'cash';
  card.amount = newAmount;
  card.recent_modify_user = user._id;
  card.save(function (err, newCard) {
    if (err || !newCard) {
      return callback({err: systemError.database_save_error});
    }

    var action = 'recharge_virtual';
    var actionName = '虚拟充值';
    if (newCard.recent_recharge_type === 'cash') {
      action = 'recharge';
      actionName = '现金充值';
    }
    addHistory(user, newCard, null, action, oldAmount, newAmount, actionName, function (err, history) {
      if (err) {
        err.zh_message += '添加充值历史记录失败！';
        return callback({err: systemError.database_save_error});
      }

      addCardStatistic(user, newCard, action, addAmount, actionName, function (err, result) {
        return callback(err, newCard);
      });
    });
  });
};

exports.deleteCard = function (user, card, callback) {
  if (!card) {
    return callback({err: cardError.card_not_exist});
  }

  if (card.deleted_status) {
    return callback({err: cardError.card_deleted});
  }

  card.deleted_status = true;
  card.recent_modify_user = user._id;
  card.save(function (err, newCard) {
    if (err || !newCard) {
      return callback({err: systemError.database_save_error});
    }
    addHistory(user, newCard, null, 'delete', newCard.amount, newCard.amount, '删除卡', function (err, history) {
      if (err) {
        err.zh_message += '添加删除卡历史记录失败！';
        return callback({err: systemError.database_save_error});
      }

      addCardStatistic(user, newCard, 'delete', parseFloat(newCard.amount.toFixed(3)), '删除', function (err, result) {
        return callback(err, newCard);
      });
    });
  });
};

exports.getCardList = function (user, currentPage, limit, skipCount, cardNumber, idNumber, nickname, type, callback) {
  var query = {
    deleted_status: false
  };
  if (cardNumber)
    query.card_number = {$regex: cardNumber, $options: '$i'};

  if (idNumber)
    query.id_number = {$regex: idNumber, $options: '$i'};

  if (nickname) {
    query.nickname = {$regex: nickname, $options: '$i'};
  }


  //普通饭卡管理员只能看到普通卡
  if (user.role === 'normal_card_manager') {
    query.type = 'normal';
  }
  //员工专家饭卡管理员可以看到员工卡，专家卡
  if (user.role === 'staff_card_manager') {
    query.type = {$in: ['staff', 'expert']};
  }

  //管理员可筛选
  if (!query.type && type) {
    query.type = type;
  }

  Card.count(query, function (err, totalCount) {
    if (err) {
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
      .exec(function (err, cardList) {
        if (err) {
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
//获取所有卡信息：根据条件和用户角色
exports.exportCardsByFilter = function (user, cardNumber, idNumber, nickname, type, callback) {
  var query = {
    deleted_status: false
  };
  if (cardNumber)
    query.card_number = {$regex: cardNumber, $options: '$i'};

  if (idNumber)
    query.id_number = {$regex: idNumber, $options: '$i'};

  if (nickname) {
    query.nickname = {$regex: nickname, $options: '$i'};
  }

  //普通饭卡管理员只能看到普通卡
  if (user.role === 'normal_card_manager') {
    query.type = 'normal';
  }
  //员工专家饭卡管理员可以看到员工卡，专家卡
  if (user.role === 'staff_card_manager') {
    query.type = {$in: ['staff', 'expert']};
  }

  //管理员可筛选
  if (!query.type && type) {
    query.type = type;
  }

  Card.find(query)
    .sort({update_time: -1})
    .exec(function (err, cardList) {
      if (err) {
        return callback({err: systemError.internal_system_error});
      }

      return callback(null, {
        cardList: cardList
      });
    });
};


function getActualAmount(card, amount, paymentStatisticThisMonth) {
  if (card.type === 'normal') {//普通卡无折扣，直接返回正常金额
    return amount;
  }

  if (paymentStatisticThisMonth.totalAmount >= 300) {//如果当月消费满300，则无折扣，直接返回正常金额
    return amount;
  }

  var theRestDiscountAmount = floatMinus(300, paymentStatisticThisMonth.totalAmount);
  if (amount <= theRestDiscountAmount) {
    return amount * card.discount;
  }

  var discountMoney = floatMul(theRestDiscountAmount, card.discount);
  var unDiscountMoney = floatMinus(amount, theRestDiscountAmount);
  return floatAdd(unDiscountMoney, discountMoney);
}

exports.pay = function (client, card, amountString, paymentStatisticThisMonth, callback) {
  if (card.deleted_status) {
    return callback({err: cardError.card_deleted});
  }

  if (card.status !== 'enabled') {
    return callback({err: cardError['card_' + card.status]});
  }

  var amount = publicLib.amountParse(amountString);
  if (amount < 0) {
    return callback({err: cardError.wrong_amount});
  }

  var actualAmount = getActualAmount(card, amount, paymentStatisticThisMonth);

  if (card.amount < actualAmount) {
    return callback({err: cardError.insufficient_balance});
  }

  var oldAmount = card.amount;
  var newAmount = floatMinus(oldAmount, actualAmount);
  card.amount = newAmount;
  card.save(function (err, newCard) {
    if (err || !newCard) {
      return callback({err: systemError.database_save_error});
    }

    addHistory(null, newCard, null, 'pay', oldAmount, newCard.amount, '消费', function (err, history) {
      if (err) {
        err.zh_message += '添加消费历史记录失败！';
        return callback({err: systemError.database_save_error});
      }

      return callback(null, {
        card: newCard,
        actualAmount: actualAmount
      });
    }, client);
  });
};

exports.changeCardStatus = function (user, card, status, callback) {
  card.status = status;
  card.save(function (err, newCard) {
    if (err || !newCard) {
      return callback({err: systemError.database_save_error});
    }

    addHistory(user, newCard, null, 'change_status', card.amount, newCard.amount, '变更卡状态为：' + status, function (err, history) {
      if (err) {
        err.zh_message += '添加变更卡状态历史记录失败！';
        return callback({err: systemError.database_save_error});
      }

      return callback(null, newCard);
    });
  });
};

exports.closeCard = function (user, card, callback) {
  var oldAmount = card.amount;
  card.status = 'close';
  card.deleted_status = true;
  card.amount = 0;
  card.save(function (err, newCard) {
    if (err || !newCard) {
      return callback({err: systemError.database_save_error});
    }

    addHistory(user, newCard, null, 'close', oldAmount, 0, '退卡', function (err, history) {
      if (err) {
        err.zh_message += '添加退卡历史记录失败！';
        return callback({err: systemError.database_save_error});
      }

      addCardStatistic(user, newCard, 'close', oldAmount, '退卡', function (err, result) {
        return callback(err, newCard);
      });
    });
  });
};

exports.replaceCard = function (user, card, newCardNumber, callback) {
  if (!newCardNumber) {
    return callback({err: cardError.card_number_null});
  }

  if (card.card_number === newCardNumber) {
    return callback({err: cardError.need_new_card_number});
  }

  Card.findOne({card_number: newCardNumber, deleted_status: false})
    .exec(function (err, findCard) {
      if (err) {
        return callback({err: systemError.database_query_error});
      }

      if (findCard) {
        return callback({err: cardError['card_' + findCard.status]});
      }

      var newCard = new Card({
        card_number: newCardNumber,
        id_number: card.id_number,
        type: card.type,
        status: 'enabled',
        amount: card.amount,
        deleted_status: false,
        nickname: card.nickname,
        discount: card.type === 'staff' ? 0.25 : 1
      });

      newCard.save(function (err, savedCard) {
        if (err || !savedCard) {
          return callback({err: systemError.database_save_error});
        }

        addHistory(user, card, savedCard, 'recreate', 0, savedCard.amount, '补卡新卡', function (err, history) {
          if (err) {
            err.zh_message += '添加补卡新卡历史记录失败！';
            return callback({err: systemError.database_save_error});
          }

          card.status = 'revoked';
          card.deleted_status = true;
          card.amount = 0;
          card.save(function (err, card) {
            if (err || !card) {
              return callback({err: systemError.database_save_error});
            }

            addHistory(user, card, savedCard, 'replace', 0, savedCard.amount, '补卡', function (err, history) {
              if (err) {
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

exports.getCardHistories = function (currentPage, limit, skipCount, filter, callback) {

  var query = {
    deleted_status: false
  };
  if (filter.keyword) {
    //
    // query.$or = [{card_number: filter.keyword},
    //   {id_number: filter.keyword}];

    var regexObj = {$regex: filter.keyword, $options: '$i'};
    query.$or = [
      {card_number: regexObj},
      {id_number: regexObj},
      {card_nickname: regexObj}
    ];
  }


  if (filter.startTime && filter.endTime) {
    query.$and = [{create_time: {$gte: filter.startTime}}, {create_time: {$lte: filter.endTime}}];
  }

  if (filter.action) {
    query.action = filter.action;
  }

  CardHistory.count(query, function (err, totalCount) {
    if (err) {
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
      .populate('create_user create_client')
      .exec(function (err, cardHistories) {
        if (err) {
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

exports.getCardStatistics = function (filter, callback) {
  var query = {};
  if (filter.keyword) {
    // query.$or = [
    //   {card_number: filter.keyword},
    //   {id_number: filter.keyword},
    //   {card_nickname: filter.keyword}
    //   ];

    var regexObj = {$regex: filter.keyword, $options: '$i'};
    query.$or = [
      {card_number: regexObj},
      {id_number: regexObj},
      {card_nickname: regexObj}
    ];
  }

  if (filter.startTime && filter.endTime) {
    query.$and = [{create_time: {$gte: filter.startTime}}, {create_time: {$lte: filter.endTime}}];
  }
  console.log('query:', query);

  CardStatistic.aggregate([{
    $match: query
  }, {
    $group: {
      _id: '$action',
      action: {$first: '$action'},
      totalAmount: {$sum: '$amount'}
    }
  }], function (err, result) {
    if (err || !result) {
      return callback({err: systemError.database_query_error});
    }
    var amountResult = {
      totalRechargeAmount: 0,
      totalCloseAmount: 0,
      totalDeleteAmount: 0
    };
    if (result.length === 0) {
      return callback(null, amountResult);
    }


    result.forEach(function (item) {
      if (item.action === 'recharge') {
        amountResult.totalRechargeAmount += item.totalAmount;
      }
      if (item.action === 'recharge_virtual') {
        amountResult.totalRechargeAmount += item.totalAmount;
      }
      if (item.action === 'close') {
        amountResult.totalCloseAmount = item.totalAmount;
      }
      if (item.action === 'delete') {
        amountResult.totalDeleteAmount = item.totalAmount;
      }
    });
    return callback(null, amountResult);
  });
};

exports.getTotalCardBalance = function (user, filter, callback) {
  var query = {
    deleted_status: false,
    status: {$in: ['enabled', 'frozen']}
  };

  if (filter.keyword) {
    query.$or = [{card_number: filter.keyword},
      {id_number: filter.keyword}];
  }

  if (filter.cardNumber)
    query.card_number = {$regex: filter.cardNumber, $options: '$i'};

  if (filter.idNumber)
    query.id_number = {$regex: filter.idNumber, $options: '$i'};

  if (filter.nickname) {
    query.nickname = {$regex: filter.nickname, $options: '$i'};
  }


  //普通饭卡管理员只能看到普通卡
  if (user.role === 'normal_card_manager') {
    query.type = 'normal';
  }
  //员工专家饭卡管理员可以看到员工卡，专家卡
  if (user.role === 'staff_card_manager') {
    query.type = {$in: ['staff', 'expert']};
  }

  //管理员可筛选
  if (!query.type && filter.type) {
    query.type = filter.type;
  }


  Card.aggregate([{
    $match: query
  }, {
    $group: {
      _id: '$object',
      totalAmount: {$sum: '$amount'}
    }
  }], function (err, result) {
    if (err || !result) {
      return callback({err: systemError.database_query_error});
    }

    if (result.length === 0) {
      return callback(null, 0);
    }

    return callback(null, result[0].totalAmount || 0);
  });
};

exports.batchRechargeCard = function (user, amount, callback) {

  return callback({err: cardError.auto_recharge_instead_of});//暂时替换！！！

  var amount = publicLib.parseFloatNumber(amount);
  if (!amount) {
    return callback({err: cardError.wrong_amount});
  }

  var query = {
    deleted_status: false,
    type: 'staff'
  };
  var successCount = 0;
  var successCards = [];
  Card.find(query, function (err, cards) {
    if (err || !cards) {
      return callback({err: systemError.database_query_error});
    }

    async.each(cards, function (card, eachCallback) {
      var oldAmount = card.amount;
      var newAmount = floatAdd(parseFloat(oldAmount.toFixed(3)), amount);
      card.amount = newAmount;
      card.recent_recharge_type = 'virtual';
      card.save(function (err, newCard) {
        if (err || !newCard) {
          return eachCallback({err: systemError.database_save_error});
        }
        addHistory(user, newCard, null, 'recharge_virtual', oldAmount, card.amount, '虚拟充值', function (err, history) {
          if (err) {
            err.zh_message += '添加充值历史记录失败！';
            return eachCallback({err: err});
          }

          addCardStatistic(user, newCard, 'recharge_virtual', amount, '虚拟充值', function (err, result) {
            if (err) {
              err.zh_message += '添加充值统计信息失败';
              return eachCallback(err);
            }

            successCount++;
            successCards.push(newCard);
            return eachCallback();
          });
        });
      });
    }, function (err) {
      return callback(err, {
        success_count: successCount,
        success_cards: successCards,
        cardCount: cards.length
      });
    });
  });
};


exports.exportCardStatistic = function (user, filter, callback) {
  var query = {};
  if (filter.startTime && filter.endTime) {
    query.$and = [{create_time: {$gte: filter.startTime}}, {create_time: {$lte: filter.endTime}}];
  }

  //新增 2018／10／29
  //如果是员工饭卡管理员只能看到 员工和专家
  if (user.role === 'staff_card_manager') {
    query.card_type = {$in: ['staff', 'expert']};
  } else if (user.role === 'normal_card_manager') {//如果是普通饭卡管理员只能看到 普通卡
    query.card_type = 'normal';
  }

  CardStatistic.aggregate([{
    $match: query
  }, {
    $group: {
      _id: {action: '$action', card_type: '$card_type'},
      action: {$first: '$action'},
      card_type: {$first: '$card_type'},
      totalAmount: {$sum: '$amount'},
      count: {$sum: 1}
    }
  }, {
    $group: {
      _id: '$_id.action',
      statistics: {$push: '$$ROOT'}
    }
  }], function (err, result) {
    if (err || !result) {
      return callback({err: systemError.database_query_error});
    }
    var statisticResult = {
      recharge_virtual: {
        amount: {
          staff: 0,
          expert: 0,
          normal: 0
        },
        count: {
          staff: 0,
          expert: 0,
          normal: 0
        }
      },
      recharge: {
        amount: {
          staff: 0,
          expert: 0,
          normal: 0
        },
        count: {
          staff: 0,
          expert: 0,
          normal: 0
        }
      },
      close: {
        amount: {
          staff: 0,
          expert: 0,
          normal: 0
        },
        count: {
          staff: 0,
          expert: 0,
          normal: 0
        }
      },
      delete: {
        amount: {
          staff: 0,
          expert: 0,
          normal: 0
        },
        count: {
          staff: 0,
          expert: 0,
          normal: 0
        }
      }
    };
    if (result.length === 0) {
      return callback(null, statisticResult);
    }


    result.forEach(function (item) {
      if (!statisticResult[item._id]) {
        return;
      }
      item.statistics.forEach(function (statistic) {
        statisticResult[item._id].amount[statistic.card_type] = parseFloat(statistic.totalAmount.toFixed(3));
        statisticResult[item._id].count[statistic.card_type] = statistic.count;
      });
    });
    return callback(null, statisticResult);
  });
};

function updateCardStatisticCardType(callback) {
  CardStatistic.find({card_type: {$exists: false}})
    .populate('card')
    .exec(function (err, statistics) {
      if (err) {
        return callback(err);
      }

      var successUpdateCount = 0;
      async.each(statistics, function (statistic, eachCallback) {
        if (statistic.card_type) {
          return eachCallback();
        }

        statistic.card_type = statistic.card.type;
        if (statistic.card.type === 'staff' && statistic.action === 'recharge') {
          statistic.action = 'recharge_virtual';
        }
        statistic.save(function (err, newStatistic) {
          if (err || !newStatistic) {
            return eachCallback(err);
          }

          successUpdateCount++;
          return eachCallback();
        });
      }, function (err) {
        if (err) {
          return callback(err, successUpdateCount);
        }

        return callback(null, successUpdateCount);

      });
    })
}

function updateCardHistoryCardType(callback) {
  CardHistory.find({action: 'recharge'})
    .populate('card')
    .exec(function (err, histories) {
      if (err) {
        return callback(err);
      }

      var successUpdateCount = 0;
      async.each(histories, function (history, eachCallback) {

        if (history.card.type === 'staff') {
          history.action = 'recharge_virtual';
          history.description = '虚拟充值';
        }
        history.save(function (err, newStatistic) {
          if (err || !newStatistic) {
            return eachCallback(err);
          }

          successUpdateCount++;
          return eachCallback();
        });
      }, function (err) {
        if (err) {
          return callback(err, successUpdateCount);
        }

        return callback(null, successUpdateCount);

      });
    })
}

//updateCardStatisticCardType(function(err, result){
//  if(err){
//    console.error('update statistic error:');
//    console.log(err);
//    console.log('update statistic count:', result);
//    return;
//  }
//
//  console.log('update statistic success!update count is ', result);
//
//});
//
//updateCardHistoryCardType(function(err, result){
//  if(err){
//    console.error('update history error:');
//    console.log(err);
//    console.log('update history count:', result);
//    return;
//  }
//
//  console.log('update history success!update count is ', result);
//
//});
//


exports.getStatisticByHistory = function (action, callback) {
  var query = {
    action: action
  };

  CardHistory.aggregate([{
    $match: query
  }, {
    $group: {
      _id: {action: '$action'},
      action: {$first: '$action'},
      oldAmount: {$sum: '$amount'},
      totalAmount: {$sum: '$new_amount'}
    }
  }], function (err, result) {
    if (err || !result) {
      return callback({err: systemError.database_query_error});
    }
    return callback(null, result);
  });
};

exports.setCardPassword = function (user, card, password, callback) {

  if (!password) {
    return callback({err: cardError.card_password_null});
  }

  if (!publicLib.isString(password) || password.length < 6) {
    return callback({err: cardError.invalid_card_password});
  }

  card.password = card.hashPassword(password);
  card.change_password_user = user._id;
  card.self_change_password = false;
  card.save(function (err, newCard) {
    if (err || !newCard) {
      return callback({err: systemError.database_save_error});
    }

    return callback(null, newCard);
  });
};

exports.paySupermarketOrder = function (client, card, supermarketOrder, actualAmount, callback) {
  if (card.deleted_status) {
    return callback({err: cardError.card_deleted});
  }

  if (card.status !== 'enabled') {
    return callback({err: cardError['card_' + card.status]});
  }

  var oldAmount = card.amount;
  var newAmount = floatMinus(oldAmount, actualAmount);
  if (newAmount < 0) {
    return callback({err: cardError.insufficient_balance});
  }
  card.amount = newAmount;
  card.save(function (err, newCard) {
    if (err || !newCard) {
      return callback({err: systemError.database_save_error});
    }

    addHistory(null, newCard, null, 'supermarket_pay', oldAmount, newCard.amount, '超市消费', function (err, history) {
      if (err) {
        err.zh_message += '添加超市消费历史记录失败！';
        return callback({err: systemError.database_save_error, info: publicLib.getStackError(err)});
      }

      return callback(null, newCard);
    }, client);
  });
};

//todo 可删除
function updateCardHistoryCardNickname(card, callback) {
  CardHistory.update({card_number: card.card_number}, {$set: {card_nickname: card.nickname}}, {multi: true})
    .exec(function (err) {
      if (err) {
        return callback({err: systemError.database_update_error});
      }

      CardHistory.update({new_card_number: card.card_number}, {$set: {new_card_nickname: card.nickname}}, {multi: true})
        .exec(function (err) {
          if (err) {
            return callback({err: systemError.database_update_error});
          }

          return callback();
        });
    });
}

function updateCardStatisticsCardNickname(card, callback) {
  CardStatistic.update({card_number: card.card_number}, {$set: {card_nickname: card.nickname}}, {multi: true})
    .exec(function (err) {
      if (err) {
        return callback({err: systemError.database_update_error});
      }

      return callback();
    });
}

exports.updateCardHistoryAndStatisticsCardNickname = function (callback) {
  Card.find({})
    .select('nickname card_number')
    .exec(function (err, cardList) {
      if (err) {
        return callback({err: systemError.database_query_error});
      }
      console.log('cardList:', cardList.length);

      async.eachSeries(cardList, function (card, eachCallback) {
        updateCardHistoryCardNickname(card, function (err) {
          if (err) {
            return eachCallback(err);
          }
          updateCardStatisticsCardNickname(card, function (err) {
            if (err) {
              return eachCallback(err);
            }
            console.log('update card:', card.card_number, card.nickname);
            return eachCallback();
          });
        });
      }, callback);
    })
};

exports.getCardsByType = function (type, callback) {
  var query = {
    deleted_status: false,
    type: type
  };
  Card.find(query, function (err, cards) {
    if (err || !cards) {
      return callback({err: systemError.database_query_error});
    }
    return callback(null, cards);
  });
};

//***虚拟充值---普通卡不支持***，每月充值1次。专家卡每月充值500，余额上限不可超过500；员工卡每月充值500，余额上限不可超过1000。
function getRealRechargeVirtualAmount(card) {
  var balance = card.amount;
  var amountForMonth = 500;
  var amountLimit = 0;
  if (card.type === 'expert') {
    amountLimit = EXPERTBALANCELIMIT;
  } else if (card.type === 'staff') {
    amountLimit = STAFFBALANCELIMIT;
  }

  var minusAmount = floatMinus(amountLimit, balance);//可充值范围
  if (minusAmount >= amountForMonth) {
    return amountForMonth;
  } else if (minusAmount > 0 && minusAmount < amountForMonth) {
    return minusAmount;
  } else {
    return 0;//余额超限制不需要充值
  }
}

//按照医院规则虚拟充值一张卡
exports.rechargeVirtualAmountToCardByRules = function (user, card, callback) {
  if (card.type === 'normal') { //普通卡不支持虚拟充值
    return callback();
  }

  var amount = getRealRechargeVirtualAmount(card); //专家卡每月充值500，余额上限不可超过500;员工卡每月充值500，余额上限不可超过1000;
  if (amount <= 0) {
    return callback();
  }

  var oldAmount = card.amount;
  var newAmount = floatAdd(parseFloat(oldAmount.toFixed(3)), amount);
  card.amount = newAmount;
  card.recent_recharge_type = 'virtual';
  card.save(function (err, newCard) {
    if (err || !newCard) {
      return callback({err: systemError.database_save_error});
    }

    addHistory(user, newCard, null, 'recharge_virtual', oldAmount, card.amount, '虚拟充值', function (err, history) {
      if (err) {
        err.zh_message += '添加充值历史记录失败！';
        return callback({err: err});
      }

      addCardStatistic(user, newCard, 'recharge_virtual', amount, '虚拟充值', function (err, result) {
        if (err) {
          err.zh_message += '添加充值统计信息失败';
          return callback(err);
        }

        return callback(null ,newCard);
      });
    });
  });
};

//自动充值历史
exports.addAutoCardRechargeHistory = function(monthString, cardType, rechargeInfo, callback){
  var autoCardRechargeHistory = new AutoCardRechargeHistory({
    month_string: monthString,
    card_type: cardType,
    total_count: rechargeInfo.cardCount,
    success_count: rechargeInfo.success_count,
    failed_count: rechargeInfo.failed_count,
    success_cards: rechargeInfo.success_cards,
    failed_cards: rechargeInfo.failed_cards
  });
  autoCardRechargeHistory.save(function(err){
    if(err){
      return callback({err: systemError.database_save_error});
    }

    return callback();
  });
};
