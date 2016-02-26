/**
 * Created by elinaguo on 16/2/26.
 */
'use strict';
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

    req.data = {
      client: client
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
