/**
 * Created by elinaguo on 16/2/26.
 */
'use strict';
var async = require('async');
var systemError = require('../errors/system');
var clientError = require('../errors/client');

var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;
var Client = appDb.model('Client');
var Cart = appDb.model('Cart');
var CartGoods = appDb.model('CartGoods');

exports.upsertPhoneUser = function (phone, callback) {
  Client.findOne({
    username: phone,
    role: 'normal'
  }).exec(function (err, client) {
    if (err) {
      return callback({err: systemError.database_query_error});
    }

    if (client && !client.deleted_status) {
      return callback(null, client);
    }

    if(!client){
      client = new Client();
    }
    client.role = 'normal';
    client.username = phone;
    client.password = '';
    client.nickname = phone;
    client.sex = 'unknown';
    client.mobile_phone = phone;
    client.deleted_status = false;
    client.save(function (err, newClient) {
      if (err || !newClient) {
        return callback({err: systemError.database_save_error});
      }

      return callback(null, newClient);
    });
  });
};

exports.signUp = function (clientInfo, callback) {
  Client.findOne({
    username: clientInfo.username,
    role: clientInfo.role ? clientInfo.role : 'normal'
  }).exec(function (err, client) {
    if (err) {
      return callback({err: systemError.internal_system_error});
    }

    if (client && !client.deleted_status) {
      return callback({err: clientError.client_exist});
    }

    if (!client) {
      client = new Client();
    }

    client.role = clientInfo.role ? clientInfo.role : 'normal';
    client.username = clientInfo.username ? clientInfo.username : '';
    client.password = clientInfo.password ? client.hashPassword(clientInfo.password) : '';
    client.nickname = clientInfo.nickname;
    client.sex = clientInfo.sex;
    client.mobile_phone = clientInfo.mobile_phone;
    client.deleted_status = false;
    client.save(function (err, newClient) {
      if (err || !newClient) {
        return callback({err: systemError.database_save_error});
      }

      return callback(null, newClient);
    });
  });
};

//工作人员登录
exports.signIn = function (username, password, callback) {
  Client.findOne({username: username, role: {$ne: 'normal'}})
    .exec(function (err, client) {
      if (err) {
        return callback({err: systemError.internal_system_error});
      }

      if (!client) {
        return callback({err: clientError.client_not_exist});
      }

      if (client.deleted_status) {
        return callback({err: clientError.client_deleted});
      }

      if (!client.authenticate(password)) {
        return callback({err: systemError.account_not_match});
      }

      return callback(null, client);
    });
};

exports.getValidClientById = function (clientId, callback) {
  Client.findOne({_id: clientId})
    .exec(function (err, client) {
      if (err) {
        return callback({err: systemError.database_query_error});
      }

      if (!client) {
        return callback({err: clientError.client_not_exist});
      }

      if (client.deleted_status) {
        return callback({err: clientError.client_deleted});
      }

      return callback(null, client);
    });
};

function updateCartGoodsCount(client, goods, goodsIndex, newGoodsCount, callback) {
  var isRemove = false;
  if (newGoodsCount <= 0) {
    isRemove = true;
  }

  if (isRemove) {
    if (goodsIndex === -1) {
      return callback(null, client);
    }

    client.cart.cart_goods.splice(goodsIndex, 1);
  } else {
    if (goodsIndex === -1) {
      client.cart.cart_goods.push(new CartGoods({
        goods_id: goods._id,
        count: newGoodsCount,
        name: goods.name,
        price: goods.price,
        display_photos: goods.display_photos
      }));
    } else {
      client.cart.cart_goods[goodsIndex].count = newGoodsCount;
      client.cart.cart_goods[goodsIndex].name = goods.name;
      client.cart.cart_goods[goodsIndex].price = goods.price;
      client.cart.cart_goods[goodsIndex].display_photos = goods.display_photos;
    }
  }

  client.markModified('cart');
  client.save(function (err, newClient) {
    if (err) {
      return callback({err: systemError.database_save_error});
    }

    return callback(null, newClient);
  });
}

require('../libraries/public');
exports.addGoodsToCart = function (client, goods, increaseCount, callback) {
  if (increaseCount <= 0) {
    return callback({err: clientError.wrong_goods_count_to_udpate_cart});
  }

  if (!client.cart) {
    client.cart = new Cart();
  }

  if (!client.cart.cart_goods) {
    client.cart.cart_goods = [];
  }

  var oldCount = 0;
  var index = client.cart.cart_goods.objectIndexOf('goods_id', goods._id.toString());
  if (index > -1) {
    oldCount = client.cart.cart_goods[index].count;
  }
  var newCount = oldCount + increaseCount;
  updateCartGoodsCount(client, goods, index, newCount, function (err, newClient) {
    if (err) {
      return callback(err);
    }

    return callback(null, newClient);
  });
};

exports.updateGoodsCountToCart = function (client, goods, updateCount, callback) {
  if (updateCount <= 0) {
    return callback({err: clientError.wrong_goods_count_to_udpate_cart});
  }

  if (!client.cart) {
    client.cart = new Cart();
  }

  if (!client.cart.cart_goods) {
    client.cart.cart_goods = [];
  }
  var index = client.cart.cart_goods.objectIndexOf('goods_id', goods._id.toString());

  updateCartGoodsCount(client, goods, index, updateCount, function (err, newClient) {
    if (err) {
      return callback(err);
    }

    return callback(null, newClient);
  });
};

exports.removeGoodsFromCart = function (client, goods, callback) {

  if (!client.cart) {
    client.cart = new Cart();
    return callback(null, client);
  }

  if (!client.cart.cart_goods) {
    client.cart.cart_goods = [];
    return callback(null, client);
  }


  var index = client.cart.cart_goods.objectIndexOf('goods_id', goods._id.toString());
  if (index === -1) {
    return callback(null, client);
  }

  updateCartGoodsCount(client, goods, index, 0, function (err, newClient) {
    if (err) {
      return callback(err);
    }

    return callback(null, newClient);
  });
};

exports.clearGoodsFromCart = function (client, goodsInfos, callback) {
  if (!client.cart || !client.cart.cart_goods || client.cart.cart_goods.length === 0) {
    return callback(null, client);
  }

  async.each(goodsInfos, function (goodsInfo, eachCallback) {
    var index = client.cart.cart_goods.objectIndexOf('goods_id', goodsInfo._id.toString());
    if (index === -1) {
      return eachCallback();
    }

    client.cart.cart_goods.splice(index, 1);
    return eachCallback();
  }, function () {
    client.markModified('cart');
    client.save(function (err, newClient) {
      if (err || !newClient) {
        return callback({err: systemError.database_save_error});
      }

      return callback(err, newClient);
    });
  });
};

exports.updateContact = function (client, contact, callback) {

  if (!contact) {
    return callback(null, client);
  }

  if (!client.contacts) {
    client.contacts = [];
  }

  var index = -1;
  client.contacts.forEach(function (oldContact, i) {
    if (oldContact.name === contact.name || oldContact.address === contact.address || oldContact.mobile_phone === contact.mobile_phone) {
      index = i;
    }
  });

  if (index > -1) {
    return callback(null, client);
  }

  client.contacts.unshift(contact);//前端插入
  client.markModified('contacts');
  client.save(function (err, newClient) {
    if (err || !newClient) {
      return callback({err: systemError.database_save_error});
    }

    return callback(null, newClient);
  });


};

exports.getAllClients = function (admin, currentPage, limit, skipCount, callback) {
  var query = {
    deleted_status: false
  };
  Client.count(query, function (err, totalCount) {
    if (err) {
      return callback({err: systemError.database_query_error});
    }

    if (limit === -1) {
      limit = totalCount;
    }

    if (skipCount === -1) {
      skipCount = limit * (currentPage - 1);
    }

    Client.find(query)
      .sort({update_time: -1})
      .skip(skipCount)
      .limit(limit)
      .exec(function (err, clients) {
        if (err) {
          return callback({err: systemError.database_query_error});
        }

        return callback(null, {
          totalCount: totalCount,
          limit: limit,
          clients: clients
        });
      });
  });
};

function getClientById(clientId, callback) {
  Client.findOne({_id: clientId})
    .exec(function (err, client) {
      if (err) {
        return callback({err: systemError.database_query_error});
      }

      return callback(null, client);

    });
}
exports.deleteClient = function (clientId, callback) {
  getClientById(clientId, function (err, client) {
    if (err) {
      return callback(err);
    }

    if (!client) {
      return callback({err: clientError.client_not_exist});
    }

    if (client.deleted_status) {
      return callback({err: clientError.client_deleted});
    }

    client.deleted_status = true;
    client.save(function (err, newClient) {
      if (err || !newClient) {
        return callback({err: systemError.database_save_error});
      }

      return callback(null, newClient);
    });
  });
};

exports.modifyClient = function (clientInfo, callback) {
  if (!clientInfo || !clientInfo._id) {
    return callback({err: systemError.param_null_error});
  }
  getClientById(clientInfo._id, function (err, client) {
    if (err) {
      return callback(err);
    }

    if (!client) {
      return callback({err: clientError.client_not_exist});
    }

    if (client.deleted_status) {
      return callback({err: clientError.client_deleted});
    }

    if (clientInfo.role) {
      client.role = clientInfo.role;
    }

    if (clientInfo.password_modify && clientInfo.password) {
      client.password = client.hashPassword(clientInfo.password);
    }

    if (clientInfo.nickname) {
      client.nickname = clientInfo.nickname;
    }

    if (clientInfo.nickname) {
      client.nickname = clientInfo.nickname;
    }

    if (clientInfo.sex) {
      client.sex = clientInfo.sex;
    }
    if (clientInfo.mobile_phone) {
      client.mobile_phone = clientInfo.mobile_phone;
    }
    client.save(function (err, newClient) {
      if (err || !newClient) {
        return callback({err: systemError.database_save_error});
      }

      return callback(null, newClient);
    });
  });
};

exports.getClientDetail = function (clientId, callback) {
  getClientById(clientId, function (err, client) {
    return callback(err, client);
  });
};


