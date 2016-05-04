/**
 * Created by elinaguo on 16/2/25.
 */
'use strict';
var cryptoLib = require('../libraries/crypto'),
  publicLib = require('../libraries/public');
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
  var currentPage = publicLib.parsePositiveIntNumber(req.query.current_page) || 1; //解析正整数
  var limit = publicLib.parsePositiveIntNumber(req.query.limit) || -1; //解析正整数
  var skipCount = publicLib.parseNonNegativeIntNumber(req.query.skip_count) || -1; //解析正整数和0
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

exports.modifyUser = function(req, res, next){
  var user = req.admin;
  var userInfo = req.body.user_info || req.query.user_info || {};
  if(!userInfo.group_id || !userInfo.username || !userInfo.password){
    return next({err: systemError.param_null_error});
  }
  userInfo.hospital_id = user.hospital;

  userLogic.modifyUser(userInfo, function(err, user){
    if(err){
      return next(err);
    }

    req.data = {
      user: user
    };
    return next();
  });
};

exports.deleteUser = function(req, res, next){
  var user = req.admin;
  var userId = req.body.user_id || req.query.user_id || '';
  if(!userId){
    return next({err: systemError.param_null_error});
  }

  userLogic.deleteUser(userId, function(err, user){
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
  var currentPage = publicLib.parsePositiveIntNumber(req.query.current_page) || 1; //解析正整数
  var limit = publicLib.parsePositiveIntNumber(req.query.limit) || -1; //解析正整数
  var skipCount = publicLib.parseNonNegativeIntNumber(req.query.skip_count) || -1; //解析正整数和0

  userLogic.getNormalUsers(admin, currentPage, limit, skipCount, function(err, result){
    if(err){
      return next(err);
    }

    req.data = {
      total_count: result.totalCount,
      limit: result.limit,
      users: result.users
    };
    return next();
  });
};

