/**
 * Created by elinaguo on 16/2/26.
 */
'use strict';
var cryptoLib = require('../libraries/crypto');
var systemError = require('../errors/system');
var clientLogic = require('../logics/client');

exports.signIn = function(req, res, next){
  var username = req.body.username || req.query.username || '';
  var password = req.body.password || req.query.password || '';
  if(!username || !password){
    return next({err: systemError.param_null_error});
  }
  clientLogic.signIn(username, password, function(err, client){
    if(err){
      return next(err);
    }

    var accessToken = cryptoLib.encrypToken({_id: client._id, time: new Date()}, 'secret1');
    delete client._doc.password;
    delete client._doc.salt;
    delete client._doc._id;

    req.data = {
      client: client,
      access_token: accessToken
    };
    return next();
  });

};

exports.signUp = function(req, res, next){
  var clientInfo = req.body.client_info || req.query.client_info || null;
  if(!clientInfo.username || !clientInfo.password){
    return next({err: systemError.param_null_error});
  }

  clientLogic.signUp(clientInfo, function(err, client){
    if(err){
      return next(client);
    }

    req.data = {
      client: client
    };
    return next();
  });
};

exports.getClientDetail = function(req, res, next){
  var clientId = req.body.client_id || req.query.client_id || '';

  clientLogic.getClientDetail(clientId, function(err, client){
    if(err){
      return next(client);
    }

    req.data = {
      client: client
    };
    return next();
  });
};

exports.modifyClient = function(req, res, next){
  var clientInfo = req.body.client_info || req.query.client_info || null;


  clientLogic.modifyClient(clientInfo, function(err, client){
    if(err){
      return next(client);
    }

    req.data = {
      client: client
    };
    return next();
  });
};

exports.deleteClient = function(req, res, next){
  var clientId = req.body.client_id || req.query.client_id || '';

  clientLogic.deleteClient(clientId, function(err, client){
    if(err){
      return next(client);
    }

    req.data = {
      success: client ? true: false
    };
    return next();
  });
};

exports.getClients = function(req, res, next){
  var admin = req.admin;
  var currentPage = req.query.current_page || req.body.current_page || 1;
  var limit = req.query.limit || req.body.limit || -1;
  var skipCount = req.query.skip_count || req.body.skip_count || -1;
  currentPage = parseInt(currentPage);
  limit = parseInt(limit);
  skipCount = parseInt(skipCount);

  clientLogic.getAllClients(admin, currentPage, limit, skipCount, function(err, result){
    if(err){
      return next(err);
    }

    req.data = {
      total_count: result.totalCount,
      limit: result.limit,
      clients: result.clients
    };
    return next();
  });
};

exports.addGoodsToCart = function(req, res, next){
  var client = req.client;
  var goods = req.goods;
  var increaseCount = req.body.increase_count || req.query.increase_count || 0;

  increaseCount = parseInt(increaseCount);

  clientLogic.addGoodsToCart(client, goods, increaseCount, function(err, newClient){
    if(err){
      return next(err);
    }

    req.data = {
      client: newClient
    };
    return next();
  });
};

exports.updateGoodsToCart = function(req, res, next){
  var client = req.client;
  var goods = req.goods;
  var count = req.body.count || req.query.count || 0;

  count = parseInt(count);

  clientLogic.updateGoodsCountToCart(client, goods, count, function(err, newClient){
    if(err){
      return next(err);
    }

    console.log(newClient);

    req.data = {
      client: newClient
    };
    return next();
  });
};

exports.removeGoodsFromCart = function(req, res, next){
  var client = req.client;
  var goods = req.goods;
  clientLogic.removeGoodsFromCart(client, goods, function(err, newClient){
    if(err){
      return next(err);
    }

    req.data = {
      client: newClient
    };
    return next();
  });
};

