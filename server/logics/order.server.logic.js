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
  var orderIdString = order._id.toString().substring(18, 6);
  return nowString + clientString + orderIdString;
}

function createContact(contactInfo, client, callback){
  if(!contactInfo){
    return callback(null, null);
  }

  Contact.findOne({_id: contactInfo._id, client: client._id})
    .exec(function(err, contact){
      if(err){
        return callback({err: systemError.internal_system_error});
      }

      if(!contact){
        contact = new Contact({
          client: client._id,
          name: contactInfo.name,
          address: contactInfo.address,
          mobile: contactInfo.mobile,
          email: contactInfo.email,
          deleted_status: false
        });
      }

      contact.common = false;
      contact.save(function(err, newContact){
        if(err || !newContact){
          return callback({err: systemError.database_save_error});
        }

        return callback(null, newContact);
      });
    });
}

function generateGoodsOrders(orderId, orderInfo, callback){
  if(!orderInfo.goods_infos || orderInfo.goods_infos.length === 0){
    return callback({err: orderError.no_goods_to_order});
  }

  var goodsOrderIds = [];
  async.each(orderInfo.goods_infos, function(goodsInfo, eachCallback){
    var goodsOrder = new GoodsOrder({
      order: orderId,
      goods: goodsInfo._id,
      status: 'prepare',
      price: goodsInfo.price,
      count: goodsInfo.count,
      description: goodsInfo.description
    });
    goodsOrder.save(function(err, newGoodsOrder){
      if(err || !newGoodsOrder){
        return eachCallback({err: systemError.database_save_error});
      }

      goodsOrderIds.push(newGoodsOrder._id);
      return eachCallback();
    });
  }, function(err){
    if(err){
      return callback(err);
    }

    return callback(null, goodsOrderIds);
  });
}

exports.createOrder = function(orderInfo, client, callback){
  if(!orderInfo){
    return callback({err: systemError.param_null_error});
  }

  createContact(orderInfo.contact, client, function(err, contact){
    if(err){
      return callback({err: systemError.internal_system_error});
    }

    var order = new Order({});
    generateGoodsOrders(order._id.toString(), orderInfo, function(err, goodsOrderIds, totalPrice){
      if(err){
        return callback(err);
      }

      order.order_number = generateOrderNumber(client, order);
      order.group_name = '餐厅';
      order.status = 'unpaid';
      order.contact = contact ? contact._id : null;
      order.name = orderInfo.name;
      order.goods_orders = goodsOrderIds;
      order.description = orderInfo.description;
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
  })
};

exports.setOrderCooking = function(order, callback){
  order.status = 'cooking';
  order.save(function(err, newOrder){
    if(err || !newOrder){
      return callback({err: systemError.database_save_error});
    }

    return callback(null, newOrder);
  });
};

exports.setOrderTransporting = function(order, callback){
  order.status = 'transporting';
  order.save(function(err, newOrder){
    if(err || !newOrder){
      return callback({err: systemError.database_save_error});
    }

    return callback(null, newOrder);
  });
};

exports.setOrderComplete = function(order, callback){
  GoodsOrder.find({order: order._id}, function(err, goodsOrders){
    if(err){
      return callback({err: systemError.database_query_error});
    }

    async.each(goodsOrders, function(goodsOrder, eachCallback){
      if(goodsOrder.status === 'complete'){
        return eachCallback();
      }

      goodsOrder.status = 'complete';
      goodsOrder.save(function(err, newGoodsOrder){
        if(err || !newGoodsOrder){
          return eachCallback({err: systemError.database_save_error});
        }

        return eachCallback();
      });
    }, function(err){
      if(err){
        return callback(err);
      }

      order.status = 'complete';
      order.save(function(err, newOrder){
        if(err || !newOrder){
          return callback({err: systemError.database_save_error});
        }

        return callback(null, true);
      });
    });
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
