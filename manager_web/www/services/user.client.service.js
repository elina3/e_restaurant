/**
* Created by elinaguo on 16/2/26.
*/

'use strict';
angular.module('EWeb').factory('UserService',
  ['Auth', 'RequestSupport', 'SystemError',
    function (Auth, RequestSupport, SystemError) {
      return {
        getGroups: function(param, callback){
          RequestSupport.executeGet('/user_groups', {
            current_page: param.currentPage,
            limit: param.limit,
            skip_count: param.skipCount
          })
            .then(function (data) {
              if (!callback) {
                return data;
              }

              if (data.err) {
                return callback(data.err);
              }

              callback(null, data);
            },
            function (err) {
              return callback(SystemError.network_error);
            });
        },
        signUp: function (param, callback) {
          RequestSupport.executePost('/user/sign_up', {
            user_info: param
          })
            .then(function (data) {
              if (!callback) {
                return data;
              }
              else {
                if (data.err) {
                  return callback(data.err);
                }

                callback(null, data);
              }
            },
            function (err) {
              return callback(SystemError.network_error);
            });
        },
        modifyUser: function(param, callback){
          RequestSupport.executePost('/user/modify', {
            user_info: param
          })
            .then(function (data) {
              if (!callback) {
                return data;
              }
              else {
                if (data.err) {
                  return callback(data.err);
                }

                callback(null, data);
              }
            },
            function (err) {
              return callback(SystemError.network_error);
            });
        },
        deleteUser: function(userId, callback){
          RequestSupport.executePost('/user/delete', {
            user_id: userId
          })
            .then(function (data) {
              if (!callback) {
                return data;
              }
              else {
                if (data.err) {
                  return callback(data.err);
                }

                callback(null, data);
              }
            },
            function (err) {
              return callback(SystemError.network_error);
            });
        },
        signIn: function(param, callback){
          RequestSupport.executePost('/user/sign_in', {
            username: param.username,
            password: param.password
          })
            .then(function (data) {
              if (!callback) {
                return data;
              }
              else {
                if (data.err) {
                  return callback(data.err);
                }
                Auth.setUser(data.user);
                Auth.setToken(data.access_token);
                return callback(null, data.user);
              }
            },
            function (err) {
              return callback(SystemError.network_error);
            });
        },
        signOut: function(){},
        translateUserRole: function(role){
          switch(role){
            case 'admin':
              return '管理员';
            case 'waiter':
              return '服务员';
            case 'cashier':
              return '收银员';
            case 'card_manager':
              return '饭卡管理员';
            case 'delivery':
              return '配送员';
            case 'cooker':
              return '厨师';
            default:
              return '未知';

          }
        },
        getUsers: function(param, callback){
          RequestSupport.executeGet('/users/list', {
            current_page: param.currentPage,
            limit: param.limit,
            skip_count: param.skipCount
          })
            .then(function (data) {
              if (!callback) {
                return data;
              }

              if (data.err) {
                return callback(data.err);
              }

              callback(null, data);
            },
            function (err) {
              return callback(SystemError.network_error);
            });
        }
      };
    }]);

