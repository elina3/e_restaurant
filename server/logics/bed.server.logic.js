/**
 * Created by elinaguo on 16/6/12.
 */
'use strict';

var async = require('async');
var mongooseLib = require('../libraries/mongoose');
var appDb = mongooseLib.appDb;
var Building = appDb.model('Building'),
  Floor = appDb.model('Floor'),
  Bed = appDb.model('Bed');

var systemError = require('../errors/system'),
  bedError = require('../errors/bed');

exports.createBuilding = function(hospitalId, buildingInfo, callback){
  if(!buildingInfo.name){
    return callback({err: bedError.building_name_null});
  }
  Building.findOne({hospital: hospitalId, name: buildingInfo.name})
    .exec(function(err, building){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      if(building){
        return callback(null,  building);
      }

      building = new Building({
        name: buildingInfo.name,
        address: buildingInfo.address,
        description: buildingInfo.description,
        hospital: hospitalId
      });
      building.save(function(err, newBuilding){
        if(err || !newBuilding){
          return callback({err: systemError.database_save_error});
        }

        return callback(null, newBuilding);
      });
    });
};

function createFloorByBuilding(building, floorInfo, callback){
  if(!floorInfo.name){
    return callback({err: bedError.floor_name_null});
  }
  Floor.findOne({building_id: building._id, name: floorInfo.name})
    .exec(function(err, floor){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      if(floor){
        return callback(null, floor);
      }

      floor = new Floor({
        name: floorInfo.name,
        description: floorInfo.description,
        building_id: building._id,
        building_name: building.name,
        building_description: building.description,
        building_address: building.address
      });
      floor.save(function(err, newFloor){
        if(err || !newFloor){
          return callback({err: systemError.database_save_error});
        }

        return callback(null, newFloor);
      });
    });
}
function getBedInfos(bedCount){
  var bedInfos = [];
  for(var i =0;i< bedCount; i++){
    bedInfos.push({name: (i+1) + '床'});
  }
  return bedInfos;
}
function createBedByBuildingFloor(building, floor, bedInfo, callback){
  if(!bedInfo.name){
    return callback({err: bedError.bed_name_null});
  }
  Bed.findOne({building_id: building._id, floor_id: floor._id, name: bedInfo.name})
    .exec(function(err, bed){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      if(bed){
        return callback(null, bed);
      }

      bed = new Bed({
        name: bedInfo.name,
        description: bedInfo.description,
        building_id: building._id,
        building_name: building.name,
        building_description: building.description,
        building_address: building.address,
        floor_id: floor._id,
        floor_name: floor.name,
        floor_description: floor.description
      });
      bed.save(function(err, newBed){
        if(err || !newBed){
          return callback({err: systemError.database_save_error});
        }

        return callback(null, newBed);
      });
    });
}
function createBedsWithFloorInfo(building, floor, bedsCount, callback){
  var beds = [];
  async.eachSeries(getBedInfos(bedsCount), function(bedInfo, eachCallback){
    createBedByBuildingFloor(building, floor, bedInfo, function(err, bed){
      if(err){
        return eachCallback(err);
      }

      beds.push(bed);
      return eachCallback();
    });
  }, function(err){
    return callback(err, beds);
  });
}

exports.createFloorBedsByBuilding = function(building, floorInfos, callback){
  var floors = [];
  async.eachSeries(floorInfos, function(floorInfo, eachCallback){
    createFloorByBuilding(building, floorInfo, function(err, floor){
      if(err){
        return eachCallback(err);
      }
      floors.push(floor);
      createBedsWithFloorInfo(building, floor, floorInfo.beds_count, function(err, beds){
        if(err){
          return eachCallback(err);
        }

        return eachCallback();
      });
    });
  }, function(err){
    return callback(err, floors);
  });
};


exports.getBuildingsByHospitalId = function(hospitalId, callback){
  if(!hospitalId){
    return callback({err: systemError.param_null_error});
  }
  Building.find({hospital: hospitalId})
    .exec(function(err, buildings){
      if(err || !buildings){
        return callback({err: systemError.database_query_error});
      }
      return callback(null, buildings);
    });
};


exports.getFloorsByBuildingId = function(buildingId, callback){
  if(!buildingId){
    return callback({err: systemError.param_null_error});
  }
  Floor.find({building_id: buildingId})
    .exec(function(err, floors){
      if(err || !floors){
        return callback({err: systemError.database_query_error});
      }
      return callback(null, floors);
    });
};


exports.getBedsByFloorId = function(floorId, callback){
  if(!floorId){
    return callback({err: systemError.param_null_error});
  }
  Bed.find({floor_id: floorId})
    .exec(function(err, beds){
      if(err || !beds){
        return callback({err: systemError.database_query_error});
      }
      return callback(null, beds);
    });
};

exports.getBuildingById = function(buildingId, callback){
  Building.findOne({_id: buildingId})
    .exec(function(err, building){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      return callback(null,  building);
    });
};
exports.getFloorById = function(floorId, callback){
  Floor.findOne({_id: floorId})
    .exec(function(err, floor){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      return callback(null,  floor);
    });
};
exports.getBedById = function(bedId, callback){
  Bed.findOne({_id: bedId})
    .exec(function(err, bed){
      if(err){
        return callback({err: systemError.database_query_error});
      }

      return callback(null,  bed);
    });
};