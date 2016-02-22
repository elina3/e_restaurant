'use strict';

var mongoose = require('mongoose');
var appDb = mongoose.createConnection(process.env.appDb, {server: {poolSize: 20}}, function (err) {
  if (err) {
    console.log('create app db ' + process.env.appDb + ' connection failed : ' + err.toString());
  } else {
    console.log('create app db ' + process.env.appDb + ' connection succeed');
  }
});

exports.appDb = appDb;

exports.generateNewObjectId = function (newId) {
  if(newId){
    return mongoose.Types.ObjectId(newId);
  }
  return new mongoose.Types.ObjectId();
};
