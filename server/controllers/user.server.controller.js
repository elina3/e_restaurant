/**
 * Created by elinaguo on 16/2/25.
 */
'use strict';
var cryptoLib = require('../libraries/crypto');
var userLogic  = require('../logics/user');
var systemError = require('../errors/system');

exports.createGroup = function(req, res, next){
  var groupInfo = req.body.group_info || req.query.group_info || {};
  if(!groupInfo.name){
    return next({err: systemError.param_null_error});
  }
  userLogic.createGroup(groupInfo, function(err, newGroup){
    if(err){
      return next(err);
    }

    req.data = {
      group: newGroup
    };
    return next();
  });
};

exports.getGroups = function(req, res, next){
  var user = req.user;
  var currentPage = parseInt(req.query.current_page) || parseInt(req.body.current_page) || 1;
  var limit = parseInt(req.query.limit) || parseInt(req.body.limit) || -1;
  var skipCount = parseInt(req.query.skip_count) || parseInt(req.body.skip_count) || -1;
  var query = {
    hospital: user.hospital
  };
  userLogic.getGroupList(query, currentPage, limit, skipCount, function(err, groups){
    if(err){
      return next(err);
    }

    req.data = {
      group_list: groups
    };
    return next();
  });
};

exports.signIn = function(req, res, next){
  var username = req.body.username || req.query.username || '';
  var password = req.body.password || req.query.password || '';
  if(!username || !password){
    return next({err: systemError.param_null_error});
  }
  userLogic.signIn(username, password, function(err, user){
    if(err){
      return next(err);
    }

    var accessToken = cryptoLib.encrypToken({_id: user._id, time: new Date()}, 'secret1');
    delete user._doc.password;
    delete user._doc.salt;
    delete user._doc._id;
    req.data = {
      user: user,
      access_token: accessToken
    };
    return next();
  });
};

exports.signUp = function(req, res, next){
  var user = req.user;
  var userInfo = req.body.user_info || req.query.user_info || {};
  if(!userInfo.group_id || !userInfo.username || !userInfo.password){
    return next({err: systemError.param_null_error});
  }
  userInfo.hospital_id = user.hospital;

  userLogic.signUp(userInfo, function(err, user){
    if(err){
      return next(err);
    }

    req.data = {
      user: user
    };
    return next();
  });
};

exports.getNormalUsers = function(req, res, next){
  var admin = req.admin;
  userLogic.getNormalUsers(admin, function(err, users){
    if(err){
      return next(err);
    }

    req.data = {
      users: users
    };
    return next();
  })
};

