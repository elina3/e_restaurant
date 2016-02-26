/**
 * Created by elinaguo on 16/2/26.
 */
'use strict';
var systemError = require('../errors/system');
var clientError = require('../errors/user');

var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;
var Client = appDb.model('Client');

expors.signUp = function(clientInfo, callback){
  Client.findOne({username: clientInfo.username})
    .exec(function(err, client){
      if(err){
        return callback({err: systemError.internal_system_error});
      }

      if(client){
        return callback({err: clientError.client_exist});
      }

      client = new Client();
      client.username = clientInfo.username ? clientInfo.username : '';
      client.password = clientInfo.password ? client.hashPassword(clientInfo.password) : '';
      client.nickname = clientInfo.nickname;
      client.sex = clientInfo.sex;
      client.mobile_phone = clientInfo.mobile_phone;
      client.save(function(err, newClient){
        if(err || !newClient){
          return callback({err: systemError.database_save_error});
        }

        return callback(null, newClient);
      });
    });
};

exports.signIn = function(username, password, callback){
  Client.findOne({username: username})
    .exec(function(err, client){
      if(err){
        return callback({err: systemError.internal_system_error});
      }

      if(!client){
        return callback({err: clientError.client_not_exist});
      }

      if (!client.authenticate(password)) {
        return callback({err: systemError.account_not_match});
      }

      return callback(null, client);
    });
};
