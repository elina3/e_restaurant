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

exports.removeGoodsFromCart = function(req, res, next){
  var client = req.client;
  var goods = req.goods;
  var removeCount = req.body.remove_count || req.query.remove_count || 0;

  removeCount = parseInt(removeCount);

  clientLogic.removeGoodsFromCart(client, goods, removeCount, function(err, newClient){
    if(err){
      return next(err);
    }

    req.data = {
      client: newClient
    };
    return next();
  });
};

