/**
 * Created by elinaguo on 16/2/25.
 */
'use strict';
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
  var currentPage = req.query.current_page || req.body.current_page || 1;
  var limit = req.query.limit || req.body.limit || -1;
  var skipCount = req.query.skip_count || req.body.skip_count || -1;
  userLogic.getGroupList(currentPage, limit, skipCount, function(err, groups){
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

    req.data = {
      user: user
    };
    return next();
  });
};

exports.signUp = function(req, res, next){
  var userInfo = req.body.user_info || req.query.user_info || {};
  if(!userInfo.group_info || !userInfo.username || !userInfo.password){
    return next({err: systemError.param_null_error});
  }

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
