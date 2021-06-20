'use strict';
var async = require('async');
var systemError = require('../errors/system');
var milkOrderError = require('../errors/v3_milk_order');

var mongooseLib = require('../libraries/mongoose'),
  publicLib = require('../libraries/public');

var appDb = mongooseLib.appDb;
var MilkOrder = appDb.model('MilkOrder');

function generateOrderNumber(client, order){
  var nowString = new Date().Format('yyyyMMdd');
  var clientString = client._id.toString().substr(18,6);
  var orderIdString = order._id.toString().substr(18, 6);
  return nowString + clientString + orderIdString;
}

function getFirstDateOfCurrentMonth(currentDate){
  return new Date(currentDate.Format('yyyy-MM') + '-01 00:00:01');
}

exports.getCurrentConsumptionAmount = function(card, callback){
  var now = new Date();
  var query = {
    card: card._id,
    $and: [{pay_time: {$gte: getFirstDateOfCurrentMonth(now)}}, {pay_time: {$lte: now}}]
  };
  MilkOrder.aggregate([{
    $match: query
  }, {
    $group: {
      _id: '$object',
      total_amount: {$sum: '$amount'}
    }
  }], function(err, results){
    if(err){
      return callback({err: systemError.database_query_error, info: publicLib.getStackError(err)});
    }

    if(results.length === 0){
      return callback(null, 0);
    }

    return callback(null, results[0].total_amount || 0);
  });
};

exports.createMilkOrder = function(milkOrderInfo, client, card, callback){
  if(!milkOrderInfo){
    return callback({err: systemError.param_null_error});
  }

  var milkOrder = new MilkOrder({
    description : milkOrderInfo.description,
    client: client._id,
    client_info: {
      nickname: client.nickname,
      username: client.username,
      mobile: client.mobile_phone
    },
    card: card._id,
    card_number: card.card_number,
    card_id_number: card.id_number,
    amount: milkOrderInfo.amount,
    actual_amount: milkOrderInfo.actual_amount
  });

  milkOrder.order_number = generateOrderNumber(client, milkOrder);
  milkOrder.save(function(err, newOrder){
    if(err || !newOrder){
      return callback({err: systemError.database_save_error});
    }

    return callback(null, newOrder);
  });
};

exports.updateMilkOrderPaid = function(milkOrderId, payTime, callback){
  MilkOrder.update({_id: milkOrderId, paid: false}, {$set: {paid: true, pay_time: payTime}}, function(err, info){
    if(err){
      return callback({err: systemError.database_update_error, info: publicLib.getStackError(err)});
    }

    console.log('update info:', info);
    return callback();
  });
};

exports.getMilkOrdersByPagination = function(filter, pagination, callback){
  var query = {
  };

  if(filter.card_id_number){
    query.card_id_number = filter.card_id_number;
  }

  if(filter.card_number){
    query.card_number = filter.card_number;
  }

  if(filter.start_time && filter.end_time){
    query.$and = [{pay_time: {$gte: filter.start_time}},{pay_time:{$lte: filter.end_time}}];
  }

  if(filter.has_discount !== null){
    query.has_discount = filter.has_discount;
  }

  async.auto({
    getMilkOrderResult: function(autoCallback){
      MilkOrder.count(query, function(err, totalCount){
        if(err){
          return autoCallback({err: systemError.database_query_error, info: publicLib.getStackError(err)});
        }

        pagination.limit = pagination.limit === -1 ? 10 : pagination.limit;
        pagination.skip_count = pagination.skip_count === -1 ? (pagination.current_page - 1) * pagination.limit : pagination.skip_count;
        MilkOrder.find(query)
          .skip(pagination.skip_count)
          .limit(pagination.limit)
          .sort({pay_time: -1})
          .populate('card')
          .exec(function(err, milkOrders){
            if(err){
              return autoCallback({err: systemError.database_query_error, info: publicLib.getStackError(err)});
            }
            return autoCallback(null, {
              totalCount: totalCount,
              limit: pagination.limit,
              currentPage: pagination.current_page,
              milkOrders: milkOrders
            });
          });
      });
    },
    getMilkOrderStatistics: function(autoCallback){
      MilkOrder.aggregate([
        {$match: query},
        {$group: {
          _id: '$object',
          amount: {$sum: '$amount'},
          actual_amount: {$sum: '$actual_amount'}
        }}
      ], function(err, result){
        if(err){
          return autoCallback({err: systemError.database_query_error, info: publicLib.getStackError(err)});
        }

        if(result.length === 0){
          return autoCallback(null, {
            amount: 0,
            actual_amount: 0
          });
        }

        return autoCallback(null, {
          amount: result[0].amount,
          actual_amount: result[0].actual_amount
        });
      });
    }
  }, function(err, results){
    if(err){
      return callback(err);
    }

    results.getMilkOrderResult.statistics = results.getMilkOrderStatistics;

    return callback(null, results.getMilkOrderResult);
  });
};
