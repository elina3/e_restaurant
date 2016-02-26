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

function generateOrderNumber(client){
  return new Date().Format('yyyyMMdd') + client._id.toString().substr(18,6)
    + mongooseLib.generateNewObjectId().toString().substring(18, 6);
}

function createContact(contactInfo, client, callback){
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

      contact.common = true;
      contact.save(function(err, newContact){
        if(err || !newContact){
          return callback({err: systemError.database_save_error});
        }

        return callback(null, newContact);
      });
    });
}

function generateGoodsOrders(orderId, orderInfo, callback){
  var goodsOrderIds = [];
  var totalPrice = 0;
  async.each(orderInfo.goods_infos, function(goodsInfo, eachCallback){
    var goodsOrder = new GoodsOrder({
      order: orderId,
      goods: goodsInfo._id,
      status: 'prepare',
      price: goodsInfo.price,
      count: goodsInfo.count,
      total_price: goodsInfo.price * goodsInfo.count,
      description: goodsInfo.description
    });
    goodsOrder.save(function(err, newGoodsOrder){
      if(err || !newGoodsOrder){
        return eachCallback({err: systemError.database_save_error});
      }

      goodsOrderIds.push(newGoodsOrder._id);
      totalPrice += goodsOrder.total_price;
      return eachCallback();
    });
  }, function(err){
    if(err){
      return callback(err);
    }

    return callback(null, goodsOrderIds, totalPrice);
  });
}

exports.createOrder = function(orderInfo, client, callback){
  createContact(orderInfo.contact, client, function(err, contact){
    if(err){
      return callback({err: systemError.internal_system_error});
    }

    var order = new Order({});
    generateGoodsOrders(order._id.toString(), orderInfo, function(err, goodsOrderIds, totalPrice){
      if(err){
        return callback(err);
      }

      order.order_number = generateOrderNumber();
      order.status = 'unpaid';
      order.contact = contact._id;
      order.name = orderInfo.name;
      order.goods_orders = goodsOrderIds;
      order.total_price = totalPrice;
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

exports.setOrderCooking = function(orderId, callback){
  Order.findOne({_id: orderId})
    .exec(function(err, order){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      if(!order){
        return callback({err: orderError.order_not_exist});
      }

      order.status = 'cooking';
      order.save(function(err, newOrder){
        if(err || !newOrder){
          return callback({err: systemError.database_save_error});
        }

        return callback(null, newOrder);
      });

    });
};
exports.setGoodsOrderCooking = function(goodsOrderId, callback){
  GoodsOrder.findOne({_id: goodsOrderId})
    .exec(function(err, goodsOrder){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      goodsOrder.status = 'cooking';
      goodsOrder.save(function(err, goodsOrder){
        if(err || !goodsOrder){
          return callback({err: systemError.database_save_error});
        }

        Order.findOne({_id: goodsOrder.order})
          .exec(function(err, order){
            if(err){
              return callback({err: systemError.database_query_error});
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
    });
};

exports.setGoodsOrderComplete = function(goodsOrderId, callback){
  GoodsOrder.findOne({_id: goodsOrderId})
    .exec(function(err, goodsOrder){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      if(goodsOrder.status === 'complete'){
        return callback({err: orderError.goods_cook_complete});
      }

      goodsOrder.status = 'complete';
      goodsOrder.save(function(err, goodsOrder){
        if(err || !goodsOrder){
          return callback({err: systemError.database_save_error});
        }

        GoodsOrder.count({_id: goodsOrderId, status: {$ne: 'complete'}}, function(err, unCookingCount){
          if(err){
            return callback({err: systemError.database_query_error});
          }

          if(unCookingCount > 0){
            return callback(null, true);
          }

          Order.findOne({_id: goodsOrder.order})
            .exec(function(err, order){
              if(err){
                return callback({err: systemError.database_query_error});
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
    });
};

exports.setOrderComplete = function(orderId, callback){
  Order.findOne({_id: orderId})
    .exec(function(err, order){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      GoodsOrder.count({order: orderId, status: {$ne: 'complete'}}, function(err, unCompleteCount){
        if(err){
          return callback({err: systemError.database_query_error});
        }

        if(unCompleteCount > 0){
          return callback({err: orderError.goods_not_cook_complete});
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

exports.deleteOrder = function(orderId, callback){
  Order.findOne({_id: orderId})
    .exec(function(err, order){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      if(!order){
        return callback({err: orderError.order_not_exist});
      }

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

    });
};
