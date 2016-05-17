/**
 * Created by elinaguo on 16/2/26.
 */
'use strict';
var async = require('async');
var systemError = require('../errors/system');
var orderError = require('../errors/order');

var mongooseLib = require('../libraries/mongoose');
var appDb = mongooseLib.appDb;
var Order = appDb.model('Order');
var GoodsOrder = appDb.model('GoodsOrder');
var Contact = appDb.model('Contact');

function generateOrderNumber(client, order){
  var nowString = new Date().Format('yyyyMMdd');
  var clientString = client._id.toString().substr(18,6);
  var orderIdString = order._id.toString().substr(18, 6);
  return nowString + clientString + orderIdString;
}

function generateContact(orderInfo, callback){
  if(orderInfo.in_store_deal){
    return callback(null, null);
  }

  if(!orderInfo.contact){
    return callback({err: orderError.no_contact_info});
  }

  if(!orderInfo.contact.name || !orderInfo.contact.address || !orderInfo.contact.mobile_phone){
    return callback({err: orderError.uncompleted_contact});
  }

  var contact = new Contact({
    name: orderInfo.contact.name,
    address: orderInfo.contact.address,
    mobile: orderInfo.contact.mobile_phone,
    email: orderInfo.contact.email
  });

  return callback(null, contact);
}

function generateGoodsOrders(orderInfo, callback){
  if(!orderInfo.goods_infos || orderInfo.goods_infos.length === 0){
    return callback({err: orderError.no_goods_to_order});
  }

  var goodsOrders = [];
  orderInfo.goods_infos.forEach(function(goodsInfo, eachCallback){
    var goodsOrder = new GoodsOrder({
      goods_id: goodsInfo._id,
      name: goodsInfo.name,
      description: goodsInfo.description,
      display_photos: goodsInfo.display_photos,
      status: 'prepare',
      price: goodsInfo.price,
      count: goodsInfo.count
    });
    goodsOrders.push(goodsOrder);
  });

  return callback(null, goodsOrders);
}

exports.createOrder = function(orderInfo, client, callback){
  if(!orderInfo){
    return callback({err: systemError.param_null_error});
  }

  generateContact(orderInfo, function(err, contact){
    if(err){
      return callback(err);
    }

    generateGoodsOrders(orderInfo, function(err, goodsOrders){
      if(err){
        return callback(err);
      }

      var order = new Order({
        group_name : '餐厅',
        status : 'unpaid',
        contact : contact ? contact : null,
        in_store_deal : contact ? false : true,
        name : orderInfo.name,
        goods_orders : goodsOrders,
        description : orderInfo.description,
        client: client._id,
        client_info: {
          nickname: client.nickname,
          username: client.username,
          mobile: client.mobile_phone
        }
      });
      order.order_number = generateOrderNumber(client, order);
      order.save(function(err, newOrder){
        if(err || !newOrder){
          return callback({err: systemError.database_save_error});
        }

        return callback(null, newOrder);
      });
    });
  });
};

function getOrderById(orderId, callback){
  Order.findOne({_id: orderId})
    .exec(function(err, order){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      return callback(null, order);
    });
}

exports.getOrderDetailByOrderId = function(orderId, callback){
  Order.findOne({_id: orderId})
    .populate('goods_orders')
    .exec(function(err, order){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      return callback(null, order);
    });
};

exports.getOrderByOrderId = function(orderId, callback){
  getOrderById(orderId, function(err, order){
    return callback(err, order);
  });
};

function queryOrders(query, sort, currentPage, limit, skipCount, callback){
  Order.count(query)
    .exec(function(err, totalCount){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      if (limit === -1) {
        limit = totalCount;
      }

      if (skipCount === -1) {
        skipCount = limit * (currentPage - 1);
      }

      if(!sort){
        sort = {
          create_time: -1
        };
      }

      Order.find(query)
        .sort(sort)
        .skip(skipCount)
        .limit(limit)
        .exec(function(err, orders){
          if(err){
            return callback({err: systemError.database_query_error});
          }


          return callback(null, {
            totalCount: totalCount,
            limit: limit,
            orders: orders
          });
        });

    });
}

exports.getMyOrders = function(client, currentPage, limit, skipCount, callback){
  var query = {deleted_status: false, client: client._id};
  queryOrders(query, {create_time: -1}, currentPage, limit, skipCount, function(err, result){
    return callback(err, result);
  });
};

exports.getOrders = function(filter, currentPage, limit, skipCount, callback){
  var query = {
    deleted_status: false
  };

  if(filter.status){
    query.status = filter.status;
  }

  if(filter.hasDiscount !== null){
    query.has_discount = filter.hasDiscount;
  }

  if(filter.startTime && filter.endTime){
    query.$and = [{create_time: {$gte: filter.startTime}},{create_time:{$lte: filter.endTime}}];
  }

  if(filter.clientUsername){

    query['client_info.username'] = filter.clientUsername;
  }

  if(filter.cardIdNumber){
    query.card_id_number = filter.cardIdNumber;
  }

  if(filter.cardNumber){
    query.card_number = filter.cardNumber;
  }

  queryOrders(query, {create_time: -1}, currentPage, limit, skipCount, function(err, result){
    return callback(err, result);
  });
};

exports.setOrderCooking = function(order, callback){
  order.goods_orders.forEach(function(goodsOrder){
    goodsOrder.status = 'cooking';
  });
  order.markModified('goods_orders');
  order.status = 'cooking';
  order.cook_time = new Date();
  order.save(function(err, newOrder){
    if(err || !newOrder){
      return callback({err: systemError.database_save_error});
    }

    return callback(null, newOrder);
  });
};

exports.setOrderTransporting = function(order, callback){
  order.goods_orders.forEach(function(goodsOrder){
    goodsOrder.status = 'complete';
  });
  order.markModified('goods_orders');
  order.status = 'transporting';
  order.delivery_time = new Date();
  order.save(function(err, newOrder){
    if(err || !newOrder){
      return callback({err: systemError.database_save_error});
    }

    return callback(null, newOrder);
  });
};

exports.setOrderComplete = function(order, callback){
  order.goods_orders.forEach(function(goodsOrder){
    goodsOrder.status = 'complete';
  });
  order.markModified('goods_orders');
  order.status = 'complete';
  order.complete_time = new Date();
  order.save(function(err, newOrder){
    if(err || !newOrder){
      return callback({err: systemError.database_save_error});
    }

    return callback(null, true);
  });
};

exports.setGoodsOrderCooking = function(goodsOrder, callback){
  goodsOrder.status = 'cooking';
  goodsOrder.save(function(err, goodsOrder){
    if(err || !goodsOrder){
      return callback({err: systemError.database_save_error});
    }

    getOrderById(goodsOrder.order, function(err, order){
      if(err){
        return callback(err);
      }

      if(order.status === 'cooking'){
        return callback(null, true);
      }

      order.status = 'cooking';
      order.save(function(err, newOrder){
        if(err || !newOrder){
          return callback({err: systemError.database_save_error});
        }

        return callback(null, true);
      });

    });

  });
};

exports.setGoodsOrderComplete = function(goodsOrder, callback){
  goodsOrder.status = 'complete';
  goodsOrder.save(function(err, goodsOrder){
    if(err || !goodsOrder){
      return callback({err: systemError.database_save_error});
    }

    GoodsOrder.count({order: goodsOrder.order, status: {$ne: ['complete']}}, function(err, unCookingCount){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      if(unCookingCount > 0){
        return callback(null, true);
      }

      getOrderById(goodsOrder.order, function(err, order){
        if(err){
          return callback(err);
        }

        if(order.status === 'transporting'){
          return callback(null, true);
        }

        order.status = 'transporting';
        order.save(function(err, newOrder){
          if(err || !newOrder){
            return callback({err: systemError.database_save_error});
          }

          return callback(null, true);
        });
      });
    });
  });
};

exports.deleteOrder = function(order, callback){
  if(order.deleted_status){
    return callback({err: orderError.order_deleted});
  }

  order.deleted_status = true;
  order.save(function(err, newOrder){
    if(err || !newOrder){
      return callback({err: systemError.database_save_error});
    }

    return callback(null, newOrder);
  });
};

exports.getLatestCommonContact = function(clientId, callback){
  Contact.sort({update_time: -1})
    .findOne({client: clientId})
    .exec(function(err, contact){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      return callback(null, contact);
    });
};

exports.getOrderStatistics = function(filter, callback){
  var query = {
    deleted_status: false
  };

  if(filter.status){
    query.status = filter.status;
  }

  if(filter.hasDiscount !== null){
    query.has_discount = filter.hasDiscount;
  }

  if(filter.startTime && filter.endTime){
    query.$and = [{create_time: {$gte: filter.startTime}},{create_time:{$lte: filter.endTime}}];
  }

  if(filter.clientUsername){
    query['client_info.username'] = filter.clientUsername;
  }

  if(filter.cardIdNumber){
    query.card_id_number = filter.cardIdNumber;
  }

  if(filter.cardNumber){
    query.card_number = filter.cardNumber;
  }

  Order.aggregate([{
    $match: query
  },{
    $group: {
      _id: '$object',
      totalAmount: {$sum: '$total_price'},
      totalActualAmount: {$sum: '$actual_amount'}
    }
  }], function(err, result){
    if(err || !result){
      return callback({err: systemError.database_query_error});
    }

    if(result.length === 0){
      return callback(null, {
        totalAmount: 0,
        totalActualAmount: 0
      });
    }

    result[0].totalAmount = parseFloat(result[0].totalAmount.toFixed(3));
    result[0].totalActualAmount = parseFloat(result[0].totalActualAmount.toFixed(3));
    delete result[0]._id;

    return callback(null, result[0]);
  });
};
