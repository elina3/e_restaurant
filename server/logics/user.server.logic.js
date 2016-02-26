/**
 * Created by elinaguo on 16/2/26.
 */
'use strict';
var systemError = require('../errors/system');
var userError = require('../errors/user');
var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;
var User = appDb.model('User');
var Group = appDb.model('Group');
exports.getGroupList = function(currentPage, limit, skipCount, callback){
  var query = {
    deleted_status: false
  };
  Group.count(query, function(err, groupCount){
    if(err){
      return callback({err: systemError.internal_system_error});
    }

    if (limit === -1) {
      limit = groupCount;
    }

    if (skipCount === -1) {
      skipCount = limit * (currentPage - 1);
    }

    Group.find(query)
      .sort({update_time: -1})
      .skip(skipCount)
      .limit(limit)
      .exec(function(err, groupList){
        if(err){
          return callback({err: systemError.internal_system_error});
        }

        return callback(null, groupList);
      });
  });
};

exports.createGroup = function(groupInfo, callback){
  Group.findOne({name: groupInfo.name})
    .exec(function(err, group){
      if(err){
        return callback({err: systemError.internal_system_error});
      }

      if(group){
        return callback({err: systemError.group_exist});
      }

      group = new Group({
        name: groupInfo.name,
        address: groupInfo.address,
        wechat_app_info: groupInfo.wechat_app_info
      });
      group.save(function(err, newGroup){
        if(err || !newGroup){
          return callback({err: systemError.database_save_error});
        }

        return callback(null, newGroup);
      });
    });
};

exports.signUp = function(userInfo, callback){


  Group.findOne({_id: userInfo.group_id})
    .exec(function(err, group){
      if(err){
        return callback({err: systemError.internal_system_error});
      }

      if(!group){
        return callback({err: userError.group_not_exist});
      }

      User.findOne({username: userInfo.username})
        .exec(function(err, user){
          if(err){
            return callback({err: systemError.internal_system_error});
          }

          if(user){
            return callback({err: userError.user_exist});
          }

          user = new User();
          user.username = userInfo.username ? userInfo.username : '';
          user.password = userInfo.password ? user.hashPassword(userInfo.password) : '';
          user.nickname = userInfo.nickname;
          user.roles = userInfo.roles;
          user.group = userInfo.group_id;
          user.sex = userInfo.sex;
          user.mobile_phone = userInfo.mobile_phone;
          user.head_photo = userInfo.head_photo;
          user.description = userInfo.description;
          user.save(function(err, newUser){
            if(err || !newUser){
              return callback({err: systemError.database_save_error});
            }

            return callback(null, newUser);
          });
        });
    });
};

exports.signIn = function(username, password, callback){
  User.findOne({username: username})
    .exec(function(err, user){
      if(err){
        return callback({err: systemError.internal_system_error});
      }

      if(!user){
        return callback({err: userError.user_not_exist});
      }

      if (!user.authenticate(password)) {
        return callback({err: systemError.account_not_match});
      }

      return callback(null, user);
    });
};
