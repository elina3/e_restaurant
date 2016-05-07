/**
* Created by elinaguo on 16/2/26.
*/
'use strict';
angular.module('EWeb').factory('ClientService', ['RequestSupport', 'SystemError', function (RequestSupport, SystemError) {
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
              return callback(data.zh_message || data.err);
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
              return callback(data.zh_message || data.err);
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
              return callback(data.zh_message || data.err);
            }

            callback(null, data);
          }
        },
        function (err) {
          return callback(SystemError.network_error);
        });
    },
    deleteClient: function(clientId, callback){
      RequestSupport.executePost('/client/delete', {
        client_id: clientId
      })
        .then(function (data) {
          if (!callback) {
            return data;
          }
          else {
            if (data.err) {
              return callback(data.zh_message || data.err);
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
            return callback(data.zh_message || data.err);
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
    }
  };
}]);
