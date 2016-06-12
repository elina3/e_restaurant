/**
 * Created by elinaguo on 16/6/12.
 */
'use strict';

var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  timestamps = require('mongoose-timestamp'),
  crypto = require('crypto');

var BuildingSchema = new Schema({
  object:{
    type:String,
    default:'Building'
  },
  name: {
    type: String
  },
  address: {
    type: String
  },
  description: {
    type: String
  },
  hospital: {
    type: Schema.Types.ObjectId,
    ref: 'Hospital'
  }
});

var FloorSchema = new Schema({
  object:{
    type:String,
    default:'Floor'
  },
  name: {
    type: String
  },
  description: {
    type: String
  },
  building_id: {
    type: Schema.Types.ObjectId,
    ref: 'Building'
  },
  building_name: {
    type: String
  },
  building_address: {
    type: String
  },
  building_description: {
    type: String
  }
});


var BedSchema = new Schema({
  object:{
    type:String,
    default:'Bed'
  },
  name: {//证件id
    type: String
  },
  description: {
    type: String
  },
  floor_id: {
    type: Schema.Types.ObjectId,
    ref: 'Floor'
  },
  floor_name: {
    type: String
  },
  floor_description: {
    type: String
  },
  building_id: {
    type: Schema.Types.ObjectId,
    ref: 'Building'
  },
  building_name: {
    type: String
  },
  building_address: {
    type: String
  },
  building_description: {
    type: String
  }
});

BedSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});


appDb.model('Building', BuildingSchema);
appDb.model('Floor', FloorSchema);
appDb.model('Bed', BedSchema);
