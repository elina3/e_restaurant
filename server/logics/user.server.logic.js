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
var Hospital = appDb.model('Hospital');
exports.getGroupList = function(query, currentPage, limit, skipCount, callback){
  query.deleted_status = false;
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
  Group.findOne({name: groupInfo.name, hospital: groupInfo.hospital_id})
    .exec(function(err, group){
      if(err){
        return callback({err: systemError.internal_system_error});
      }

      if(!group){
        group = new Group({
          name: groupInfo.name,
          hospital: groupInfo.hospital_id
        });
      }

      group.address = groupInfo.address;
      group.wechat_app_info = groupInfo.wechat_app_info;
      group.save(function(err, newGroup){
        if(err || !newGroup){
          return callback({err: systemError.database_save_error});
        }

        return callback(null, newGroup);
      });
    });
};

exports.createHospital = function(hospitalInfo, callback){
  Hospital.findOne({name: hospitalInfo.name})
    .exec(function(err, hospital){
      if(err){
        return callback({err: systemError.internal_system_error});
      }

      if(!hospital){
        hospital = new Hospital({
          name: hospitalInfo.name
        });
      }

      hospital.address = hospitalInfo.address;
      hospital.groups = hospitalInfo.groups;
      hospital.admins = hospitalInfo.admins;
      hospital.save(function(err, newGroup){
        if(err || !newGroup){
          return callback({err: systemError.database_save_error});
        }

        return callback(null, newGroup);
      });
    });
};


exports.signUpAdmin = function(userInfo, callback){
  Hospital.findOne({_id: userInfo.hospital_id})
    .exec(function(err, hospital){
      if(err){
        return callback({err: systemError.internal_system_error});
      }

      if(!hospital){
        return callback({err: userError.hospital_not_exist});
      }

      User.findOne({username: userInfo.username, status: 'admin', hospital: userInfo.hospital_id})
        .exec(function(err, admin){
          if(err){
            return callback({err: systemError.internal_system_error});
          }

          if(admin){
            return callback({err: userError.admin_exist});
          }

          admin = new User();
          admin.username = userInfo.username ? userInfo.username : '';
          admin.password = userInfo.password ? admin.hashPassword(userInfo.password) : '';
          admin.nickname = userInfo.nickname;
          admin.role = userInfo.role;
          admin.sex = userInfo.sex;
          admin.mobile_phone = userInfo.mobile_phone;
          admin.head_photo = userInfo.head_photo;
          admin.description = userInfo.description;
          admin.hospital = userInfo.hospital_id;
          admin.save(function(err, newUser){
            if(err || !newUser){
              return callback({err: systemError.database_save_error});
            }

            if(!hospital.admins){
              hospital.admins = [];
            }
            hospital.admins.push(admin._id);
            hospital.save(function(err, newHospital){
              if(err || !newHospital){
                return callback({err: systemError.database_save_error});
              }

              return callback(null, newUser);
            });
          });
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
          user.role = userInfo.role;
          user.group = userInfo.group_id;
          user.hospital = group.hospital;
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
    .populate('group hospital')
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

exports.getValidUserById = function(userId, callback){
  User.findOne({_id: userId})
    .exec(function(err, user){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      if(!user){
        return callback({err: userError.user_not_exist});
      }

      if(user.deleted_status){
        return callback({err: userError.user_deleted});
      }

      return callback(null, user);
    });
};

