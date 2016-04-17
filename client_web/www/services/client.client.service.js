/**
* Created by elinaguo on 16/2/26.
*/
'use strict';
angular.module('EClientWeb').factory('ClientService', ['RequestSupport', 'SystemError', function (RequestSupport, SystemError) {
  return {
    addNewClient: function (param, callback) {
      RequestSupport.executePost('/client', {
        client_info: param
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
    getClientDetail: function (clientId, callback) {
      RequestSupport.executeGet('/client', {
        client_id: clientId
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
    modifyClient: function(param, callback){
      RequestSupport.executePost('/client/modify', {
        client_id: param.client_id,
        client_info: param
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
      RequestSupport.executePost('/client/sign_in', {
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

            if(!data.client){
              return callback({err: SystemError.sign_in_failed});
            }
            callback(null, data);
          }
        },
        function (err) {
          return callback(SystemError.network_error);
        });
    },
    getClients: function(param, callback){
      RequestSupport.executeGet('/client/list', {
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
    translateClientRole: function(role){
      switch(role){
        case 'normal':
          return '普通用户';
        case 'waiter':
          return '服务员';
        case 'cashier':
          return '收银员';
        default:
          return '未知';

      }
    },
    addGoodsToCart: function(client, goods, count, callback){
      RequestSupport.executePost('/client/cart/add', {
        goods_id: goods._id,
        increase_count: count
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
    }
  };
}]);
