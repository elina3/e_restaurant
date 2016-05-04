/**
 * Created by louisha on 15/10/10.
 */

'use strict';
angular.module('EClientWeb').service('RequestSupport',
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
                if(data.type === 'entity.too.large'){
                    console.error('请求数据超过最大限制，最大限制为', data.limit + ' bytes');
                    console.log(data);
                    return {err: data.type, message: data.message};
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
                executeGetByPath: function (path, params) {
                    var q = $q.defer();
                    $http.get(path, {params: params})
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
