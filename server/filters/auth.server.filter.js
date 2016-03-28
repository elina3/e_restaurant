/**
 * Created by elinaguo on 16/2/26.
 */
'use strict';
var cryptoLib = require('../libraries/crypto');
var systemError = require('../errors/system');
var userLogic = require('../logics/user');
var clientLogic = require('../logics/client');
exports.requireAdmin = function(req, res, next){
  var token;
  token = req.body.access_token || req.query.access_token;

  req.connection = req.connection || {};
  req.socket = req.socket || {};
  req.connection.socket = req.connection.socket || {};

  if (!token){
    return res.send({err: systemError.undefined_access_token});
  }

  try {
    token = cryptoLib.decrpToken(token, 'secret1');
  }
  catch (e) {
    return res.send({err: systemError.invalid_access_token});
  }

  userLogic.getValidUserById(token._id, function(err, user){
    if(err){
      return next(err);
    }

    if(user.role !== 'admin'){
      return next({err: systemError.no_permission});
    }

    req.admin = user;
    next();
  });
};

exports.requireUser = function(req, res, next){
  var token;
  token = req.body.access_token || req.query.access_token;

  req.connection = req.connection || {};
  req.socket = req.socket || {};
  req.connection.socket = req.connection.socket || {};

  if (!token){
    return res.send({err: systemError.undefined_access_token});
  }

  try {
    token = cryptoLib.decrpToken(token, 'secret1');
  }
  catch (e) {
    return res.send({err: systemError.invalid_access_token});
  }

  userLogic.getValidUserById(token._id, function(err, user){
    if(err){
      return next(err);
    }

    req.user = user;
    next();
  });
};


exports.requireClient = function(req, res, next){
  var token;
  token = req.body.access_token || req.query.access_token;

  req.connection = req.connection || {};
  req.socket = req.socket || {};
  req.connection.socket = req.connection.socket || {};

  if (!token){
    return res.send({err: systemError.undefined_access_token});
  }

  try {
    token = cryptoLib.decrpToken(token, 'secret1');
  }
  catch (e) {
    return res.send({err: systemError.invalid_access_token});
  }

  clientLogic.getValidClientById(token._id, function(err, client){
    if(err){
      return next(err);
    }

    req.client = client;
    next();
  });
};
