/**
 * Created by elinaguo on 16/2/22.
 */
'use strict';
var systemError  = require('../errors/system');
var cardLogic = require('../logics/card');
var publicLib = require('../libraries/public');
//办卡
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
//充值
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
//卡详情
exports.getCardDetail = function (req, res, next) {
  req.data = {
    card: req.card
  };
  return next();
};
//删除卡
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
//卡列表
exports.getCardList = function (req, res, next) {
  var currentPage = publicLib.parsePositiveIntNumber(req.query.current_page) || 1; //解析正整数
  var limit = publicLib.parsePositiveIntNumber(req.query.limit) || -1; //解析正整数
  var skipCount = publicLib.parseNonNegativeIntNumber(req.query.skip_count) || -1; //解析正整数和0

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
//卡历史
exports.getCardHistories = function (req, res, next) {
  var currentPage = parseInt(req.query.current_page) || parseInt(req.body.current_page) || 1;
  var limit = parseInt(req.query.limit) || parseInt(req.body.limit) || -1;
  var skipCount = parseInt(req.query.skip_count) || parseInt(req.body.skip_count) || -1;

  var timeRange = JSON.parse(req.query.time_range) || {};

  var startTime = new Date(timeRange.startTime) || new Date('1970-1-1 00:00:00');
  var endTime = new Date(timeRange.endTime) || new Date();

  var keyword = req.query.keyword || '';
  var action = req.query.action || '';
  var filter = {
    startTime: startTime,
    endTime: endTime,
    keyword: keyword,
    action: action
  };
  cardLogic.getCardHistories(currentPage, limit, skipCount, filter, function (err, result) {
    if (err) {
      req.err = err;
      return next();
    }

    req.data = {
      card_history_list: result.cardHistories,
      total_count: result.totalCount,
      limit: result.limit
    };
    return next();
  });
};
//卡统计
exports.getCardStatistics = function (req, res, next) {
  var startTimeStamp = parseInt(req.query.start_time_stamp) || -1;
  var endTimeStamp = parseInt(req.query.end_time_stamp) || -1;
  var keyword = req.query.keyword || '';
  var filter = {
    startTime: startTimeStamp === -1 ? null : new Date(startTimeStamp),
    endTime: endTimeStamp === -1 ? null : new Date(endTimeStamp),
    keyword: keyword
  };
  cardLogic.getCardStatistics(filter, function (err, result) {
    if (err) {
      return next(err);
    }

    req.data = {
      total_recharge_amount: result.totalRechargeAmount,
      total_close_amount: result.totalCloseAmount,
      total_delete_amount: result.totalDeleteAmount
    };
    return next();
  });
};
//卡余额
exports.getCardBalance = function(req, res, next){
  var keyword = req.query.keyword || '';
  var filter = {
    keyword: keyword
  };
  cardLogic.getTotalCardBalance(filter, function (err, totalCardBalance) {
    if (err) {
      return next(err);
    }

    req.data = {
      total_card_balance: totalCardBalance
    };
    return next();
  });
};

//批量充值员工卡
exports.batchRechargeCard = function(req, res, next){
  if(req.user.role !== 'admin' && req.user.role === 'card-manager'){
   return next({err: systemError.no_permission});
  }
  cardLogic.batchRechargeCard(req.user, req.body.amount, function(err, result){
    if(err){
      return next(err);
    }
    req.data = result;
    return next();
  });
};
//饭卡导入
exports.importCards = function(req, res, next){
  var cardList = req.body.card_list || [];
  var user = req.user;
  cardLogic.importStaffCards(user, cardList, function(err, result){
    if(err){
      return next(err);
    }

    req.data = result;
    return next();
  });
};
//饭卡当日财务统计
exports.exportCardStatistic = function(req, res, next){
  var timeRange = JSON.parse(req.query.time_range) || {};

  var startTime = new Date(timeRange.startTime) || new Date('1970-1-1 00:00:00');
  var endTime = new Date(timeRange.endTime) || new Date();

  cardLogic.exportCardStatistic({startTime: startTime, endTime: endTime}, function(err, result){
    if(err){
      return next(err);
    }

    result.begin_time = startTime;
    result.end_time = endTime;
    req.data = result;
    return next();
  });
};

exports.getStatisticByHistory = function(req, res, next){
  cardLogic.getStatisticByHistory(req.query.action, function(err, result){
    if(err){
      return next(err);
    }

    req.data = {
      result: result
    };
    return next();
  });
};


//清除脏数据 TODO 将要删除
var mongooseLib = require('../libraries/mongoose');
var appDb = mongooseLib.appDb;
var CardHistory = appDb.model('CardHistory');

exports.deleteCardPay = function(req, res, next){
  var cardHistoryId = req.body.card_history_id || '';
  if(!cardHistoryId){
    return next({err: {type: 'card_history_id_null', message: 'the card history id is null', zh_message: '卡记录id为空'}});
  }

  CardHistory.findOne({_id: cardHistoryId})
    .exec(function(err, cardHistory){
      if(err){
        return next(err);
      }

      if(!cardHistory){
        return next({err: {type: 'card_history_not_exist', message: 'the card history is not exist', zh_message: '卡记录不存在'}})
      }

      if(cardHistory.deleted_status){
        return next({err: {type: 'card_history_deleted', message: 'the card history is deleted', zh_message: '卡记录已删除'}})
      }

      if(cardHistory.action !== 'pay'){
        return next({err: {type: 'card_history_not_pay', message: 'the card history is not the paying ', zh_message: '卡记录不是消费记录'}});
      }

      cardHistory.deleted_status = true;
      cardHistory.save(function(err, newCardHistory){
        if(err || !newCardHistory){
          return next(err);
        }

        req.data = {
          card_history: newCardHistory
        };
        return next();
      });
    });
};