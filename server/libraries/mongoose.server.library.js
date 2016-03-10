'use strict';

var mongoose = require('mongoose');
var config = require('../config/config');
var appDb = mongoose.createConnection(config.appDb, {server: {poolSize: 20}}, function (err) {
  if (err) {
    console.log('create app db ' + config.appDb + ' connection failed : ' + err.toString());
  } else {
    console.log('create app db ' + config.appDb + ' connection succeed');
  }
});

exports.appDb = appDb;

exports.generateNewObjectId = function (newId) {
  if(newId){
    return mongoose.Types.ObjectId(newId);
  }
  return new mongoose.Types.ObjectId();
};
