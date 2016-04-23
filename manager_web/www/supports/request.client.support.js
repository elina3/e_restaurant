/**
* Created by louisha on 15/10/10.
*/

'use strict';
angular.module('EWeb').service('RequestSupport',
  ['$http', '$q', 'Config', 'SystemError', 'Auth',
      function ($http, $q, Config, SystemError, Auth) {
          function handleData(data) {
              if (!data) {
                  return {err: SystemError.data_is_null};
              }
              if (data.err) {
                  return {err: data.err.type, message: data.err.message, zh_message: data.err.zh_message};
              }
              if (data.error) {
                  return {err: data.error.type};
              }
              return data;
          }

          return {
              executePost: function (url, body) {
                  body = body || {};
                  body.access_token = Auth.getToken();
                  var q = $q.defer();
                  $http.post(Config.serverAddress + url, body)
                    .success(function (data) {
                        q.resolve(handleData(data));
                    })
                    .error(function (err) {
                        q.reject(err);
                    });
                  return q.promise;
              },
              executeGet: function (url, params) {
                  params = params || {};
                  params.access_token = Auth.getToken();
                  var q = $q.defer();
                  $http.get(Config.serverAddress + url, {
                      params: params
                  })
                    .success(function (data) {
                        q.resolve(handleData(data));
                    })
                    .error(function (err) {
                        q.reject(err);
                    });
                  return q.promise;
              },
              executePut: function (url, body) {
                body = body || {};
                body.access_token = Auth.getToken();
                var q = $q.defer();
                $http.put(Config.serverAddress + url, body)
                  .success(function (data) {
                    q.resolve(handleData(data));
                  })
                  .error(function (err) {
                    q.reject(err);
                  });
                return q.promise;
              },
              executeDelete: function (url, body) {
                body = body || {};
                body.access_token = Auth.getToken();
                var q = $q.defer();
                $http.delete(Config.serverAddress + url, body)
                  .success(function (data) {
                    q.resolve(handleData(data));
                  })
                  .error(function (err) {
                    q.reject(err);
                  });
                return q.promise;
              },
              executeGetByPath: function (path) {
                  var q = $q.defer();
                  $http.get(path)
                    .success(function (data) {
                        q.resolve(handleData(data));
                    })
                    .error(function (err) {
                        q.reject(err);
                    });
                  return q.promise;
              }
          };
      }]);
