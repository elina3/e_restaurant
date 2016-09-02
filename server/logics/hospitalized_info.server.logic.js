/**
 * Created by elinaguo on 16/6/25.
 */
'use strict';

var mongooseLib = require('../libraries/mongoose');
var appDb = mongooseLib.appDb;
var HospitalizedInfo = appDb.model('HospitalizedInfo');

var systemError = require('../errors/system'),
  hospitalizedInfoError = require('../errors/hospitalized_info');

function validIdNumber(idNumberString) {
  idNumberString = idNumberString.toUpperCase();
  if (/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(idNumberString)) {
    return true;
  }
  return false;
}

//新建入住信息
exports.createNewHospitalizedInfo = function (user, building, floor, bed, sickerInfo, callback) {
  if (!sickerInfo) {
    return callback({err: hospitalizedInfoError.sicker_info_null});
  }

  if (!validIdNumber(sickerInfo.idNumber)) {
    return callback({err: hospitalizedInfoError.invalid_id_number});
  }

  if (!sickerInfo.nickname) {
    return callback({err: hospitalizedInfoError.nickname_null});
  }

  var query = {
    deleted_status: false,
    id_number: sickerInfo.idNumber,
    is_hospitalized: true,
    is_leave_hospital: false
  };
  HospitalizedInfo.findOne(query)
    .exec(function (err, hospitalizedInfo) {
      if (err) {
        return callback({err: systemError.database_query_error});
      }

      if (hospitalizedInfo) {
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
        recent_update_user: user._id,
        recent_update_user_info: userInfo
      });

      hospitalizedInfo.save(function (err, newHospitalizedInfo) {
        if (err || !newHospitalizedInfo) {
          return callback({err: systemError.database_save_error});
        }

        return callback(null, newHospitalizedInfo);
      });
    });
};

//查询入住信息
exports.queryHospitalizedInfoByIdNumber = function (filter, callback) {

  var query = {
    deleted_status: false
  };

  if(filter.idNumber){
    query.id_number = {$regex: filter.idNumber, $options: '$i'};
  }

  HospitalizedInfo.find(query)
    .populate('building floor bed')
    .sort({create_time: -1})
    .exec(function (err, hospitalizedInfos) {
      if (err || !hospitalizedInfos) {
        return callback({err: systemError.database_query_error})
      }

      return callback(null, hospitalizedInfos);
    });

  //HospitalizedInfo.findOne(query)
  //  .populate('building floor bed')
  //  .exec(function (err, hospitalizedInfo) {
  //    if (err) {
  //      return callback({err: systemError.database_query_error})
  //    }
  //
  //    if (hospitalizedInfo) {
  //      return callback(null, [hospitalizedInfo]);
  //    }
  //
  //    delete query.is_hospitalized;
  //    delete query.is_leave_hospital;
  //    HospitalizedInfo.find(query)
  //      .populate('building floor bed')
  //      .exec(function (err, hospitalizedInfos) {
  //        if (err || !hospitalizedInfos) {
  //          return callback({err: systemError.database_query_error})
  //        }
  //
  //        return callback(null, hospitalizedInfos);
  //      });
  //  });
};

exports.queryHospitalizedInfoByFilter = function (building, floor, callback) {
  var query = {
    deleted_status: false,
    building: building._id.toString(),
    floor: floor._id.toString(),
    is_hospitalized: true,
    is_leave_hospital: false
  };
  HospitalizedInfo.find(query)
    .populate('building floor bed')
    .exec(function (err, hospitalizedInfos) {
      if (err || !hospitalizedInfos) {
        return callback({err: systemError.database_query_error})
      }

      return callback(null, hospitalizedInfos);
    });
};

//出院手续
exports.leaveHospital = function (user, hospitalizedInfo, description, callback) {
  if (hospitalizedInfo.is_leave_hospital) {
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
  hospitalizedInfo.save(function (err, newHospitalizedInfo) {
    if (err || !newHospitalizedInfo) {
      return callback({err: systemError.database_save_error});
    }

    return callback(null, newHospitalizedInfo);
  });
};

//添加出院备注
exports.addLeaveDescription = function (user, hospitalizedInfo, description, callback) {
  hospitalizedInfo.leave_description = description;
  hospitalizedInfo.recent_update_user = user._id;
  hospitalizedInfo.recent_update_user_info = {
    username: user.username,
    nickname: user.nickname
  };
  hospitalizedInfo.save(function (err, newHospitalizedInfo) {
    if (err || !newHospitalizedInfo) {
      return callback({err: systemError.database_save_error});
    }

    return callback(null, newHospitalizedInfo);
  });
};

//根据id获取hospitalizedInfo
exports.getHospitalizedInfoById = function (hospitalizedInfoId, population, callback) {
  population = population || '';
  HospitalizedInfo.findOne({_id: hospitalizedInfoId})
    .populate(population)
    .exec(function (err, hospitalizedInfo) {
      if (err) {
        return callback({err: systemError.database_query_error});
      }

      if (!hospitalizedInfo) {
        return callback({err: hospitalizedInfoError.hospitalized_info_not_exist});
      }

      return callback(null, hospitalizedInfo);
    });
};

exports.getHospitalizedInfoByBed = function (buildingId, floorId, bedId, callback) {
  HospitalizedInfo.findOne({
    deleted_status: false,
    building: buildingId,
    floor: floorId,
    bed: bedId,
    is_hospitalized: true,
    is_leave_hospital: false
  })
    .exec(function (err, hospitalizedInfo) {
      if (err) {
        return callback({err: systemError.database_query_error});
      }
      return callback(null, hospitalizedInfo);
    });
};

exports.getHospitalizedInfoByIds = function (ids, callback) {
  HospitalizedInfo.find({_id: {$in: ids}})
    .exec(function (err, hospitalizedInfos) {
      if (err) {
        return callback({err: systemError.database_save_error});
      }
      return callback(null, hospitalizedInfos);
    });
};

exports.getHospitalizedInfoByBedId = function (bedId, callback) {
  HospitalizedInfo.findOne({
    bed: bedId,
    is_hospitalized: true,
    is_leave_hospital: false,
    deleted_status: false
  }).exec(function (err, hospitalizedInfo) {
    if (err) {
      return callback({err: systemError.database_save_error});
    }

    return callback(null, hospitalizedInfo);
  });
};

exports.changeToNewBed = function (oldHospitalizedInfo, bed, callback) {
  var hospitalizedInfo = new HospitalizedInfo({
    building: bed.building_id,
    floor: bed.floor_id,
    bed: bed._id,
    id_number: oldHospitalizedInfo.id_number,
    nickname: oldHospitalizedInfo.nickname,
    sex: oldHospitalizedInfo.sex,
    phone: oldHospitalizedInfo.phone,
    description: oldHospitalizedInfo.description,
    hospitalized_time: oldHospitalizedInfo.hospitalized_time,
    hospitalized_creator: oldHospitalizedInfo.hospitalized_creator,
    hospitalized_creator_info: oldHospitalizedInfo.hospitalized_creator_info,
    is_hospitalized: oldHospitalizedInfo.is_hospitalized,
    recent_update_user: oldHospitalizedInfo.recent_update_user,
    is_leave_hospital: oldHospitalizedInfo.is_leave_hospital,
    leave_description: oldHospitalizedInfo.leave_description,
    leave_hospital_time: oldHospitalizedInfo.leave_hospital_time,
    leave_hospital_creator: oldHospitalizedInfo.leave_hospital_creator,
    leave_hospital_creator_info: oldHospitalizedInfo.leave_hospital_creator_info,
    recent_update_user_info: oldHospitalizedInfo.recent_update_user_info,
    deleted_status: false
  });
  hospitalizedInfo.save(function(err, newHospitalizedInfo){
    if(err || !newHospitalizedInfo){
      return callback({err: systemError.database_save_error});
    }

    oldHospitalizedInfo.deleted_status = false;
    oldHospitalizedInfo.save(function(err, savedOld){
      if(err || !savedOld){
        return callback({err: systemError.database_save_error});
      }

      return callback(null, newHospitalizedInfo);
    });
  });
};

exports.modifyHospitalizedInfoBed = function(user, hospitalizedInfo, newBedInfo, callback){
  hospitalizedInfo.building = newBedInfo.building_id;
  hospitalizedInfo.floor = newBedInfo.floor_id;
  hospitalizedInfo.bed = newBedInfo._id;
  hospitalizedInfo.change_user = user._id;
  hospitalizedInfo.save(function(err, newHospitalizedInfo){
    if(err || !newHospitalizedInfo){
      return callback({err: systemError.database_save_error});
    }

    return callback(null, newHospitalizedInfo);
  });
};

exports.getBedsWithSickInBuildingFloor = function(buildingId, floorId, callback){
  HospitalizedInfo.find({
    building: buildingId,
    floor: floorId,
    is_hospitalized: true,
    is_leave_hospital: false,
    deleted_status: false
  }).exec(function(err, hospitalizedInfos){
    if(err || !hospitalizedInfos){
      return callback({err: systemError.database_query_error});
    }

    return callback(null, hospitalizedInfos.map(function(item){
      return item.bed;
    }));
  });
};