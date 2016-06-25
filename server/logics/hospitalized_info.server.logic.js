/**
 * Created by elinaguo on 16/6/25.
 */
'use strict';

var mongooseLib = require('../libraries/mongoose');
var appDb = mongooseLib.appDb;
var HospitalizedInfo = appDb.model('HospitalizedInfo');

var systemError = require('../errors/system'),
  hospitalizedInfoError = require('../errors/hospitalized_info');

function validIdNumber(idNumberString){
  idNumberString = idNumberString.toUpperCase();
  if (/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(idNumberString)) {
    return true;
  }
  return false;
}

//新建入住信息
exports.createNewHospitalizedInfo = function(user, building, floor, bed, sickerInfo, callback){
  if(!sickerInfo){
    return callback({err: hospitalizedInfoError.sicker_info_null});
  }

  if(!validIdNumber(sickerInfo.idNumber)){
    return callback({err: hospitalizedInfoError.invalid_id_number});
  }

  if(!sickerInfo.nickname){
    return callback({err: hospitalizedInfoError.nickname_null});
  }

  var query = {
    deleted_status: false,
    id_number: sickerInfo.idNumber,
    is_hospitalized: true,
    is_leave_hospital: false
  };
  HospitalizedInfo.findOne(query)
    .exec(function(err, hospitalizedInfo){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      if(hospitalizedInfo){
        return callback({err: hospitalizedInfoError.sicker_hospitalized});
      }

      var userInfo = {
        username: user.username,
        nickname: user.nickname
      };

      hospitalizedInfo = new HospitalizedInfo({
        building: building._id,
        floor: floor._id,
        bed: bed._id,
        id_number: sickerInfo.idNumber,
        nickname: sickerInfo.nickname,
        sex: sickerInfo.sex,
        phone: sickerInfo.phone,
        description: sickerInfo.description,
        hospitalized_time: new Date(),
        hospitalized_creator: user._id,
        hospitalized_creator_info: userInfo,
        is_hospitalized: true,
        deleted_status: false,
        recent_update_user: user._id,
        recent_update_user_info: userInfo
      });

      hospitalizedInfo.save(function(err, newHospitalizedInfo){
        if(err || !newHospitalizedInfo){
          return callback({err: systemError.database_save_error});
        }

        return callback(null, newHospitalizedInfo);
      });
    });
};

//查询入住信息
exports.queryHospitalizedInfo = function(user, filter, pagination, callback){
  if(!validIdNumber(filter.idNumber)){
    return callback({err: hospitalizedInfoError.invalid_id_number});
  }

  var query = {
    deleted_status: false,
    id_number: filter.idNumber,
    is_hospitalized: true,
    is_leave_hospital: false
  };
  HospitalizedInfo.findOne(query)
    .exec(function(err, hospitalizedInfo){
      if(err){
        return callback({err: systemError.database_query_error})
      }

      if(hospitalizedInfo){
        return callback(null, [hospitalizedInfo]);
      }

      delete query.is_hospitalized;
      delete query.is_leave_hospital;
      HospitalizedInfo.find(query)
        .exec(function(err, hospitalizedInfos){
          if(err || !hospitalizedInfos){
            return callback({err: systemError.database_query_error})
          }

          return callback(null, hospitalizedInfos);
        });
    });
};

//出院手续
exports.leaveHospital = function(user, hospitalizedInfo, description, callback){
  if(hospitalizedInfo.is_leave_hospital){
    return callback({err: hospitalizedInfoError.is_leave_hospital});
  }

  var userInfo = {
    username: user.username,
    nickname: user.nickname
  };
  hospitalizedInfo.is_leave_hospital = true;
  hospitalizedInfo.leave_description = description;
  hospitalizedInfo.leave_hospital_time = new Date();
  hospitalizedInfo.leave_hospital_creator = user._id;
  hospitalizedInfo.leave_hospital_creator_info = userInfo;
  hospitalizedInfo.recent_update_user = user._id;
  hospitalizedInfo.recent_update_user_info = userInfo;
  hospitalizedInfo.save(function(err, newHospitalizedInfo){
    if(err || !newHospitalizedInfo){
      return callback({err: systemError.database_save_error});
    }

    return callback(null, newHospitalizedInfo);
  });
};

//添加出院备注
exports.addLeaveDescription = function(user, hospitalizedInfo, description, callback){
  hospitalizedInfo.leave_description = description;
  hospitalizedInfo.recent_update_user = user._id;
  hospitalizedInfo.recent_update_user_info = {
    username: user.username,
    nickname: user.nickname
  };
  hospitalizedInfo.save(function(err, newHospitalizedInfo){
    if(err || !newHospitalizedInfo){
      return callback({err: systemError.database_save_error});
    }

    return callback(null, newHospitalizedInfo);
  });
};

//根据id获取hospitalizedInfo
exports.getHospitalizedInfoById = function(hospitalizedInfoId, callback){
  HospitalizedInfo.findOne({_id: hospitalizedInfoId})
    .exec(function(err, hospitalizedInfo){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      if(!hospitalizedInfo){
        return callback({err: hospitalizedInfoError.hospitalized_info_not_exist});
      }

      return callback(null, hospitalizedInfo);
    });
};