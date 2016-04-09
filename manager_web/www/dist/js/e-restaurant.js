'use strict';
/**
 * Created by louisha on 15/9/24.
 */
var eWeb = angular.module('EWeb', [
    'ui.router',
    'ngAnimate',
    'ngMessages',
    'LocalStorageModule',
    'base64'
]);

eWeb.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        //.state('goods_list', {
        //    url: '/goods_list',
        //    templateUrl: '/templates/goods/goods_list.client.view.html',
        //    controller: 'GoodsListController'
        //})
        //.state('goods_add', {
        //    abstract: true,
        //    url: '/goods_add',
        //    templateUrl: '/templates/goods/goods_add.client.view.html',
        //    controller: 'GoodsAddController'
        //})
        .state('user_sign_up', {
            url: '/user/sign_up',
            templateUrl: 'templates/user/sign_up.client.view.html',
            controller: 'UserSignUpController'
        })
        .state('user_sign_in', {
            url: '/user/sign_in',
            templateUrl: 'templates/user/sign_in.client.view.html',
            controller: 'UserSignInController'
        })
      .state('goods_manager', {
          url: '/good/manager:goods_type',
          templateUrl: 'templates/goods/goods_manager.client.view.html',
          controller: 'GoodsManagerController'
      })
      .state('user_manager', {
          url: '/user/manager',
          templateUrl: 'templates/user/user_manager.client.view.html',
          controller: 'UserManagerController'
      })
        .state('user_index', {
          url: '/user/index',
          templateUrl: 'templates/user/user_index.client.view.html',
          controller: 'UserIndexController'
        })
        //.state('client_sign_up', {
        //    url: '/client/client_sign_up',
        //    templateUrl: '/templates/client/sign_up.client.view.html',
        //    controller: 'ClientSignUpController'
        //})
        //.state('client_sign_in', {
        //    url: '/client/client_sign_in',
        //    templateUrl: '/templates/client/sign_in.client.view.html',
        //    controller: 'ClientSignInController'
        //})
    ;

    $urlRouterProvider.otherwise('/user/sign_in');
}]);

eWeb.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('PublicInterceptor');

    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    /**
     * The workhorse; converts an object to x-www-form-urlencoded serialization.
     * @param {Object} obj
     * @return {String}
     */
    var param = function (obj) {
        var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
        for (name in obj) {
            value = obj[name];

            if (value instanceof Array) {
                for (i = 0; i < value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if (value instanceof Object) {
                for (subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if (value !== undefined && value !== null)
                query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }
        return query.length ? query.substr(0, query.length - 1) : query;
    };

    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [function (data) {
        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];
}]);


/**
 * Created by louisha on 15/10/10.
 */

'use strict';

angular.module('EWeb').constant('Config', {
    serverAddress: 'http://' + window.location.host,
    //serverAddress: 'https://zhuzhu1688.com',
    //serverAddress: 'https://agilepops.com',
    qiniuServerAddress: 'https://dn-agilepops.qbox.me'
});

/**
* Created by louisha on 15/9/24.
*/

'use strict';

angular.module('EWeb').factory('Auth',
    ['localStorageService',
        function (localStorageService) {
            var currentUser = null;
            var currentToken = '';
            return {
                isLogin: function () {
                    return (this.getToken() || this.getUser());
                },
                getUser: function () {
                    if (!currentUser) {
                        currentUser = localStorageService.get('user');
                    }
                    if (currentUser) {
                        return currentUser;
                    }
                    else {
                        return null;
                    }
                },
                setUser: function (user) {
                    if (!user) {
                        localStorageService.set('user', '');
                        return;
                    }
                    currentUser = user;
                    localStorageService.set('user', user);
                },
                getToken: function () {
                    if (!currentToken) {
                        currentToken = localStorageService.get('token');
                    }
                    if (currentToken) {
                        return currentToken;
                    }
                    else {
                        return '';
                    }
                },
                setToken: function (token) {
                    if (!token) {
                        localStorageService.set('token', '');
                        return;
                    }
                    currentToken = token;
                    localStorageService.set('token', token);
                },
                signOut: function () {
                    currentUser = null;
                    currentToken = null;
                    localStorageService.set('token', currentToken);
                }
            };

        }]);

///**
// * Created by elinaguo on 16/2/26.
// */
//'use strict';
//angular.module('EWeb').factory('UserService', ['RequestService', function (RequestService) {
//  return {
//    clientSignIn: function (username, password) {
//      return RequestService.executePost('/client/sign_in', {
//        username: username,
//        password: password
//      });
//    },
//    clientSignUp: function (obj) {
//      return RequestService.executePost('/client/sign_up', {
//        distributor_info: obj
//      });
//    }
//  };
//}]);

/**
 * Created by elinaguo on 16/3/30.
 */

'use strict';
angular.module('EWeb').factory('GoodsService',
  ['Auth', 'RequestSupport', 'SystemError',
    function (Auth, RequestSupport, SystemError) {
      return {
        getGoods: function(param, callback){
          RequestSupport.executeGet('/goods_list', {
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
        createGoods: function (param, callback) {
          RequestSupport.executePost('/goods', {
            goods_info: param
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
        modifyGoods: function(param, callback){
          RequestSupport.executePut('/goods', {
            goods_info: param
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
        deleteGoods: function(goodsId, callback){
          RequestSupport.executeDelete('/goods', {
            goods_id: goodsId
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
        translateGoodsStatus: function(role){
          switch(role){
            case 'sold_out':
              return '售罄';
            case 'on_sale':
              return '热卖中';
            case 'none':
              return '未上架';
            default:
              return '未上架';

          }
        }
      };
    }]);


//'use strict';
///**
// * Created by louisha on 15/6/24.
// */
//angular.module('EWeb').service('QiNiuService',
//    ['$http', '$q', 'localStorageService', 'RequestService', 'Config',
//        function ($http, $q, localStorageService, RequestService, Config) {
//            function utf16to8(str) {
//                var out, i, len, c;
//                out = '';
//                len = str.length;
//                for (i = 0; i < len; i++) {
//                    c = str.charCodeAt(i);
//                    if ((c >= 0x0001) && (c <= 0x007F)) {
//                        out += str.charAt(i);
//                    } else if (c > 0x07FF) {
//                        out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
//                        out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
//                        out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
//                    } else {
//                        out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
//                        out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
//                    }
//                }
//                return out;
//            }
//
//            /*
//             * Interfaces:
//             * b64 = base64encode(data);
//             */
//            var base64EncodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
//
//            function base64encode(str) {
//                var out, i, len;
//                var c1, c2, c3;
//                len = str.length;
//                i = 0;
//                out = '';
//                while (i < len) {
//                    c1 = str.charCodeAt(i++) & 0xff;
//                    if (i === len) {
//                        out += base64EncodeChars.charAt(c1 >> 2);
//                        out += base64EncodeChars.charAt((c1 & 0x3) << 4);
//                        out += '==';
//                        break;
//                    }
//                    c2 = str.charCodeAt(i++);
//                    if (i === len) {
//                        out += base64EncodeChars.charAt(c1 >> 2);
//                        out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
//                        out += base64EncodeChars.charAt((c2 & 0xF) << 2);
//                        out += '=';
//                        break;
//                    }
//                    c3 = str.charCodeAt(i++);
//                    out += base64EncodeChars.charAt(c1 >> 2);
//                    out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
//                    out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
//                    out += base64EncodeChars.charAt(c3 & 0x3F);
//                }
//                return out;
//            }
//
//
//            var uploadEndPoint = 'http://up.qiniu.com';
//
//            // if page loaded over HTTPS, then uploadEndPoint should be "https://up.qbox.me", see https://github.com/qiniu/js-sdk/blob/master/README.md#%E8%AF%B4%E6%98%8E
//            if (window && window.location && window.location.protocol === 'https:') {
//                uploadEndPoint = 'https://up.qbox.me';
//            }
//
//            var defaultsSetting = {
//                chunkSize: 1024 * 1024 * 4,
//                mkblkEndPoint: uploadEndPoint + '/mkblk/',
//                mkfileEndPoint: uploadEndPoint + '/mkfile/',
//                maxRetryTimes: 3
//            };
//
//            //Is support qiniu resumble upload
//            this.support = (
//            typeof File !== 'undefined' &&
//            typeof Blob !== 'undefined' &&
//            typeof FileList !== 'undefined' &&
//            (!!Blob.prototype.slice || !!Blob.prototype.webkitSlice || !!Blob.prototype.mozSlice ||
//            false
//            )
//            );
//            if (!this.support) {
//                return null;
//            }
//
//            var fileHashKeyFunc = function (file) {
//                return file.name + file.lastModified + file.size + file.type;
//            };
//
//            return {
//                upload: function (config) {
//                    var deferred = $q.defer();
//                    var promise = deferred.promise;
//
//                    var file = config.file;
//                    if (!file) {
//                        return;
//                    }
//
//                    var fileHashKey = fileHashKeyFunc(file);
//                    var blockRet = localStorageService.get(fileHashKey);
//                    if (!blockRet) {
//                        blockRet = [];
//                    }
//                    var blkCount = (file.size + ((1 << 22) - 1)) >> 22;
//
//                    var getChunck = function (file, startByte, endByte) {
//                        return file[(file.slice ? 'slice' : (file.mozSlice ? 'mozSlice' : (file.webkitSlice ? 'webkitSlice' : 'slice')))](startByte, endByte);
//                    };
//
//                    var getBlkSize = function (file, blkCount, blkIndex) {
//
//                        if (blkIndex === blkCount - 1) {
//                            return file.size - 4194304 * blkIndex;
//                        } else {
//                            return 4194304;
//                        }
//                    };
//
//                    var mkfile = function (file, blockRet) {
//                        if (blockRet.length === 0) {
//                            return;
//                        }
//                        var body = '';
//                        var b;
//                        for (var i = 0; i < blockRet.length - 1; i++) {
//                            b = angular.fromJson(blockRet[i]);
//                            body += (b.ctx + ',');
//                        }
//                        b = angular.fromJson(blockRet[blockRet.length - 1]);
//                        body += b.ctx;
//
//                        var url = defaultsSetting.mkfileEndPoint + file.size;
//                        if (config && config.key) {
//                            url += ('/key/' + base64encode(utf16to8(config.key)));
//                        }
//                        $http({
//                            url: url,
//                            method: 'POST',
//                            data: body,
//                            headers: {
//                                'Authorization': 'UpToken ' + config.token,
//                                'Content-Type': 'text/plain'
//                            }
//                        }).success(function (e) {
//                            deferred.resolve(e);
//                            localStorageService.remove(fileHashKey);
//                        }).error(function (e) {
//                            deferred.reject(e);
//                        });
//                    };
//                    var xhr;
//
//                    var mkblk = function (file, i, retry) {
//                        if (i === blkCount) {
//                            mkfile(file, blockRet);
//                            return;
//                        }
//                        if (!retry) {
//                            deferred.reject('max retried,still failure');
//                            return;
//                        }
//                        var blkSize = getBlkSize(file, blkCount, i);
//                        var offset = i * 4194304;
//                        var chunck = getChunck(file, offset, offset + blkSize);
//
//                        xhr = new XMLHttpRequest();
//                        xhr.open('POST', defaultsSetting.mkblkEndPoint + blkSize, true);
//                        xhr.setRequestHeader('Authorization', 'UpToken ' + config.token);
//
//                        xhr.upload.addEventListener('progress', function (evt) {
//                            if (evt.lengthComputable) {
//                                var nevt = {
//                                    totalSize: file.size,
//                                    loaded: evt.loaded + offset
//                                };
//                                deferred.notify(nevt);
//                            }
//                        });
//
//                        xhr.upload.onerror = function () {
//                            mkblk(config.file, i, --retry);
//                        };
//
//                        xhr.onreadystatechange = function (response) {
//                            if (response && xhr.readyState === 4 && xhr.status === 200) {
//                                if (xhr.status === 200) {
//                                    blockRet[i] = xhr.responseText;
//                                    localStorageService.set(fileHashKey, blockRet);
//                                    mkblk(config.file, ++i, defaultsSetting.maxRetryTimes);
//                                } else {
//                                    mkblk(config.file, i, --retry);
//                                }
//                            }
//                        };
//                        xhr.send(chunck);
//                    };
//
//
//                    mkblk(config.file, blockRet.length, defaultsSetting.maxRetryTimes);
//                    promise.abort = function () {
//                        xhr.abort();
//                        localStorageService.remove(fileHashKey);
//                    };
//
//                    promise.pause = function () {
//                        xhr.abort();
//                    };
//
//                    return promise;
//                },
//                qiNiuKey: function () {
//                    return RequestService.executeGet('/token/image/upload', {});
//                },
//                qiNiuUptokenUrl: function () {
//                    return Config.serverAddress + '/token/image/upload';
//                }
//            };
//        }]);

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


/**
 * Created by elinaguo on 16/4/2.
 */

'use strict';
angular.module('EWeb').service('FileUploadSupport',
  ['$http', '$q', 'Config', 'SystemError', 'Auth',
    function ($http, $q, Config, SystemError, Auth) {
      function handleData(data) {
        if (!data) {
          return {err: SystemError.data_is_null};
        }
        if (data.err) {
          return {err: data.err.type, message: data.err.message};
        }
        if (data.error) {
          return {err: data.error.type};
        }
        return data;
      }

      return {
        uploadFile: function (url, body) {
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
                  return {err: data.err.type, message: data.err.message};
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

/**
 * Created by louisha on 15/7/3.
 */
'use strict';

angular.module('EWeb').constant('EventError',
    {
        invalid_account: '无效的账户',
        invalid_password: '密码错误',
        account_not_match: '账户不匹配',
        internal_system_error: '系统错误，请联系管理员',
        undefined_access_token: '账户access_token不存在',
        invalid_access_token: '账户信息丢失，请重新登录',
        account_existed: '账号已存在',
        account_deleted: '账号已删除',
        user_not_exist: '用户不存在',
        not_admin:'不是管理员',
        null_error: '字段值错误',
        params_error: '参数错误',
        id_param_null: '_id参数为空',
        account_not_exist: '该账号不存在',
        name_null: '名称不存在',
        category_not_exist: '产品品类不存在',
        username_param_error: '手机输入不正确',
        password_param_error: '密码输入不正确',
        invalid_mobile_phone: '电话号码输入不正确',
        contact_name_null: '联系人信息还没有',
        district_null: '区域信息还没有',
        distributor_not_exist: '经销商不存在',
        distributor_deleted: '经销商已被删除',
        no_grocery_address:'地址还没有',
        no_grocery_location:'地理位置还没有',
        no_grocery_photos:'店铺照片还没有',
        no_grocery_area:'店铺区域还没有',
        no_annual_sales:'年营业额还没有',
        grocer_deleted:'小店已删除',
        cart_null:'购物车不存在',
        category_null:'商品品类不存在',
        goods_id_null:'商品ID为空',
        brand_null:'商品标签为空',
        goods_not_exist:'商品不存在',
        goods_deleted:'商品已下架',
        price_param_error:'价格输入错误',
        market_price_param_error:'价格输入错误',
        name_param_error:'名称输入错误',
        grocer_not_exist:'小店不存在',
        grocer_id_null:'小店ID不存在',
        distributor_null:'合作商还没有',
        wrong_price:'错误的价格',
        distributor_goods_source_not_match:'经销商商品不匹配',
        sku_null:'SKU不存在',
        no_grocery_name:'小店名称还没有',
        goods_source_not_match:'商品来源不匹配',
        grocer_order_not_exist:'订单不存在',
        grocer_order_deleted:'订单已被删除',
        grocer_order_id_null:'订单ID',
        no_nickname:'请输入姓名'
    }
);

/**
* Created by louisha on 15/9/24.
*/
'use strict';

angular.module('EWeb').constant('SystemError',
    {
        internal_system_error: '系统错误，请联系管理员',
        undefined_access_token: '账户失效不存在',
        invalid_access_token: '账户信息失效，请重新登录',
        null_error: '字段值错误',
        params_error: '参数错误',
        network_error: '网络错误',
        database_save_error: '数据库保存异常',
        data_is_null: '服务器返回数据为空'
    }
);

/**
 * Created by elinaguo on 16/3/29.
 */
'use strict';

angular.module('EWeb').constant('UserError',
  {
    user_exist: '用户已存在，请更改用户名',
    group_not_exist: '用户组别不存在',
    user_deleted: '用户已删除'
  }
);

'use strict';
angular.module('EWeb').constant('GlobalEvent',
    {
        onShowLoading: 'onShowLoading',
        onShowAlert: 'onShowAlert',
        onShowAlertConfirm: 'onShowAlertConfirm',
        onLoadAreaInfoSucess: 'onLoadAreaInfoSucess',
        onBodyClick: 'onBodyClick'
    }
);

'use strict';

angular.module('EWeb').factory('PublicInterceptor', ['Auth', function (Auth) {
    return {
        'request': function (req) {
            req.data = req.data ? req.data : {};
            if (typeof(req.data) === 'object') {
                req.data.access_token = Auth.getToken();
            }
            req.params = req.params ? req.params : {};
            if (typeof(req.params) === 'object') {
                req.params.access_token = Auth.getToken();
                req.params.no_cache = new Date().getTime();
            }
            return req;
        },
        'response': function (resp) {
            return resp;
        },
        'requestError': function (rejection) {
            return rejection;
        },
        'responseError': function (rejection) {
            return rejection;
        }
    };
}]);


///**
// * Created by louisha on 15/7/7.
// */
//'use strict';
//angular.module('eWeb').controller('GrocerAcountListController',
//    ['$rootScope', '$scope', 'GlobalEvent', 'AccountServer', '$state',
//        function ($rootScope, $scope, GlobalEvent, AccountServer, $state) {
//
//            $scope.initPage = {
//                accountList: []
//            };
//
//            function getAccountList() {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                AccountServer.getGrocerList().then(function (data) {
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    if (data.err) {
//                        $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                    }
//                    else {
//                        $scope.initPage.accountList = data.grocers;
//                    }
//
//
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            getAccountList();
//
//            $scope.onEdit = function (account) {
//                $state.go('grocerSignUp', {account: account._id});
//            };
//
//            $scope.onDelete = function (id) {
//                $scope.$emit(GlobalEvent.onShowAlertConfirm, {info: '是否确认删除？'}, function () {
//
//                    $scope.$emit(GlobalEvent.onShowLoading, true);
//                    AccountServer.deleteGrocer(id).then(function (data) {
//                        $scope.$emit(GlobalEvent.onShowLoading, false);
//                        if (data.err) {
//                            console.log(data.err);
//                            $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                        }
//                        else if (data.error) {
//                            console.log(data.error);
//                            $scope.$emit(GlobalEvent.onShowAlert, data.error.type);
//                        }
//                        else if (data.success) {
//                            $scope.$emit(GlobalEvent.onShowAlert, '删除成功');
//                            getAccountList();
//                        } else {
//                            $scope.$emit(GlobalEvent.onShowAlert, '删除失败');
//                        }
//
//                    }, function (err) {
//                        console.log(err);
//                    });
//
//                });
//
//            };
//        }]);

///**
// * Created by louisha on 15/7/10.
// */
//'use strict';
//angular.module('eWeb').controller('GrocerHometController',
//    ['$scope', 'GlobalEvent', 'SignService', 'Config', '$state', 'EnvironmentService', 'DownloadService',
//        function ($scope, GlobalEvent, SignService, Config, $state, EnvironmentService, DownloadService) {
//
//            $scope.initPage = {
//                downloadAndroidLink: DownloadService.GROCER_ANDROID_LINK,
//                downloadIOSLink: DownloadService.groceyIosLink(),
//                downloadDistributorAndroidLink: DownloadService.DISTRIBUTOR_ANDROID_LINK,
//                downloadDistributorIOSLink: DownloadService.distributorIosLink(),
//                downloadDeliveryAndroidLink: DownloadService.DELIVERY_ANDROID_LINK,
//                downloadDeliveryIOSLink: DownloadService.deliveryIosLink(),
//                ercode_img: ''
//            };
//            $scope.signInConfig = {
//                username: '',
//                password: ''
//            };
//            $scope.goDistributorSignIn = function () {
//                $state.go('distributorSignIn');
//            };
//            $scope.signIn = function () {
//                if (!$scope.signInConfig.username || !$scope.signInConfig.password) {
//                    return $scope.$emit(GlobalEvent.onShowAlert, '请输入用户名或密码');
//                }
//                if ($scope.signInConfig.password.length < 6) {
//                    return $scope.$emit(GlobalEvent.onShowAlert, '密码不能少于6位');
//
//                }
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                SignService.grocerySignIn($scope.signInConfig.username, $scope.signInConfig.password).then(function (data) {
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    console.log(data);
//                    if (data.err) {
//                        return $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                    }
//                    if (data.error) {
//                        return $scope.$emit(GlobalEvent.onShowAlert, data.error.type);
//                    }
//                    window.location = Config.serverAddress + '/grocery/#/home/' + data.access_token;
//                }, function (err) {
//                    console.log(err);
//                    return $scope.$emit(GlobalEvent.onShowAlert, '登录失败，网络错误');
//                });
//            };
//
//            function closeLoading(inx) {
//                if (inx <= 0) {
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                }
//            }
//
//            function init() {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                var request_inx = 3;
//                DownloadService.getGroceryAppInfo(function (err, data) {
//                    if (err) {
//                        console.log(err.type);
//                    }
//                    request_inx--;
//                    closeLoading(request_inx);
//                    $scope.initPage.downloadIOSLink = DownloadService.groceyIosLink();
//                });
//
//                DownloadService.getDistributorAppInfo(function (err, data) {
//                    if (err) {
//                        console.log(err.type);
//                    }
//                    request_inx--;
//                    closeLoading(request_inx);
//                    $scope.initPage.downloadDistributorIOSLink = DownloadService.distributorIosLink();
//                });
//
//                DownloadService.getDeliveryAppInfo(function (err, data) {
//                    if (err) {
//                        console.log(err.type);
//                    }
//                    request_inx--;
//                    closeLoading(request_inx);
//                    $scope.initPage.downloadDeliveryIOSLink = DownloadService.deliveryIosLink();
//                });
//            }
//
//            $scope.downloadIos = function (type) {
//                var _link = '';
//                switch (type) {
//                    case 'shop':
//                        _link = $scope.initPage.downloadIOSLink;
//                        break;
//                    case 'distributor':
//                        _link = $scope.initPage.downloadDistributorIOSLink;
//                        break;
//                    case 'delivery':
//                        _link = $scope.initPage.downloadDeliveryIOSLink;
//                        break;
//
//                }
//                window.open(_link);
//            };
//
//            init();
//
//        }]);

///**
// * Created by louisha on 15/6/19.
// */
//'use strict';
//angular.module('eWeb').controller('GrocerSignUpController',
//    ['$rootScope',
//        '$scope',
//        'GlobalEvent',
//        '$base64',
//        'Global',
//        'BMapService',
//        'QiNiuService',
//        'Config',
//        'SignService',
//        '$stateParams',
//        'AccountServer',
//        '$state',
//        function ($rootScope, $scope, GlobalEvent, $base64, Global, BMapService, QiNiuService, Config, SignService, $stateParams, AccountServer, $state) {
//
//            function getDomById(id) {
//                return document.getElementById(id);
//            }
//
//            function getQiniuKey() {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                QiNiuService.qiNiuKey().then(function (data) {
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    console.log(data);
//                    $scope.initPage.qiniu_key = data.token;
//
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            function getGrocerById(id) {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                AccountServer.getGrocerById(id).then(function (data) {
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    console.log(data);
//                    if (data.err) {
//                        return $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                    }
//                    if (data.error) {
//                        return $scope.$emit(GlobalEvent.onShowAlert, data.error.type);
//                    }
//                    $scope.initPage.account = data.grocer;
//                    if ($scope.initPage.account) {
//                        $scope.signUpObject.username = $scope.initPage.account.username;
//                        $scope.signUpObject.password = $scope.initPage.account.password;
//                        $scope.signUpObject.nickname = $scope.initPage.account.nickname;
//                        $scope.signUpObject.grocery_name = $scope.initPage.account.grocery_name;
//                        $scope.signUpObject.grocery_area = $scope.initPage.account.grocery_area;
//                        $scope.signUpObject.grocery_photos = $scope.initPage.account.grocery_photos;
//                        $scope.signUpObject.grocery_address = $scope.initPage.account.grocery_address;
//                        $scope.signUpObject.grocery_longitude = $scope.initPage.account.grocery_location[0];
//                        $scope.signUpObject.grocery_latitude = $scope.initPage.account.grocery_location[1];
//                        $scope.signUpObject.grocery_annual_sales = $scope.initPage.account.grocery_annual_sales;
//                        $scope.signUpObject.district = $scope.initPage.account.district || '';
//                        if ($scope.signUpObject.district !== '') {
//                            var area = $scope.initPage.account.district.split('-');
//                            $scope.initPage.province = area[0];
//                            $scope.initPage.city = area[1];
//                            $scope.initPage.county = area[2];
//                        }
//                        for (var i = 0; i < $scope.initPage.account.grocery_photos.length; i++) {
//                            var obj = {
//                                img: Config.qiniuServerAddress + $scope.initPage.account.grocery_photos[i]
//
//                            };
//                            $scope.initPage.grocery_photo.push(obj);
//                        }
//
//                    }
//
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            $scope.initPage = {
//                showMap: false,
//                map: null,
//                grocery_photo: [],
//                qiniu_key: '',
//                search_key: '',
//                provinces: [],
//                citys: [],
//                countys: [],
//                province: '',
//                city: '',
//                county: '',
//                account: null,
//                title: '',
//                annual_sales: ['20万以下', '20-50万', '50-100万', '100-150万', '150-200万', '200万以上']
//            };
//            $scope.signUpObject = {
//                username: '',
//                password: '',
//                nickname: '',
//                phone: '',
//                mobile_phone: '',
//                grocery_name: '',
//                grocery_photos: [],
//                grocery_area: '',
//                grocery_longitude: '',
//                grocery_latitude: '',
//                grocery_address: '',
//                business_license: '',
//                grocery_annual_sales: '',
//                district: ''
//            };
//
//            function initSignUpObject() {
//                $scope.signUpObject.username = '';
//                $scope.signUpObject.password = '';
//                $scope.signUpObject.nickname = '';
//                $scope.signUpObject.phone = '';
//                $scope.signUpObject.mobile_phone = '';
//                $scope.signUpObject.grocery_name = '';
//                $scope.signUpObject.grocery_area = '';
//                $scope.signUpObject.grocery_photos = [];
//                $scope.signUpObject.grocery_address = '';
//                $scope.signUpObject.grocery_longitude = '';
//                $scope.signUpObject.grocery_latitude = '';
//                $scope.signUpObject.business_license = '';
//                $scope.signUpObject.grocery_annual_sales = '';
//                $scope.signUpObject.district = '';
//
//                $scope.initPage.grocery_photo = [];
//            }
//
//            function initAreaInfo() {
//                Global.getAreaInfo(function (err, area) {
//                    if (area) {
//                        initArea(area);
//                    }
//                });
//
//            }
//
//            function initArea(province) {
//                $scope.initPage.province = province[0].name;
//                $scope.initPage.city = province[0].citys[0].name;
//                $scope.initPage.county = province[0].citys[0].county[0].name;
//
//                province.forEach(function (p) {
//                    $scope.initPage.provinces.push(p.name);
//                    p.citys.forEach(function (c) {
//                        $scope.initPage.citys.push(c.name);
//                        c.county.forEach(function (co) {
//                            $scope.initPage.countys.push(co.name);
//                        });
//                    });
//                });
//            }
//
//            function initDate() {
//                $scope.initPage.grocery_photo = [];
//                if ($stateParams.account) {
//                    $scope.initPage.title = '小店编辑';
//                    getGrocerById($stateParams.account);
//                }
//                else {
//                    $scope.initPage.title = '小店注册';
//                }
//
//                initMap();
//
//            }
//
//            function start(index) {
//                $scope.initPage.grocery_photo[index].progress = {
//                    p: 0
//                };
//                $scope.initPage.grocery_photo[index].upload = QiNiuService.upload({
//                    //key: '',
//                    file: $scope.initPage.grocery_photo[index].file,
//                    token: $scope.initPage.qiniu_key
//                });
//                $scope.initPage.grocery_photo[index].upload.then(function (response) {
//                    console.log(response);
//                    $scope.signUpObject.grocery_photos.splice(index, 0, response.key);
//                    $scope.initPage.grocery_photo[index].img = Config.qiniuServerAddress + response.key;
//
//                }, function (response) {
//                    console.log(response);
//                }, function (evt) {
//                    $scope.initPage.grocery_photo[index].progress.p = Math.floor(100 * evt.loaded / evt.totalSize);
//                });
//            }
//
//            $scope.abort = function (index) {
//                if ($scope.initPage.grocery_photo[index].upload) {
//                    //待修改的，非上传图片属性不会有这个属性
//                    $scope.initPage.grocery_photo[index].upload.abort();
//
//                }
//                $scope.initPage.grocery_photo.splice(index, 1);
//                $scope.signUpObject.grocery_photos.splice(index, 1);
//            };
//
//            $scope.onFileSelect = function ($files) {
//                var offsetx = $scope.initPage.grocery_photo.length;
//                for (var i = 0; i < $files.length; i++) {
//                    $scope.initPage.grocery_photo[i + offsetx] = {
//                        file: $files[i]
//                    };
//                    start(i + offsetx);
//                }
//            };
//
//            $scope.showMap = function () {
//                $scope.initPage.showMap = true;
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                BMapService.setToLocation($scope.initPage.map, function () {
//                    $scope.$apply(function () {
//                        $scope.$emit(GlobalEvent.onShowLoading, false);
//                    });
//                });
//            };
//
//            $scope.hideMap = function () {
//                $scope.initPage.showMap = false;
//            };
//
//            $scope.refreshLocation = function () {
//                var current = $scope.initPage.map.getCenter();
//                $scope.signUpObject.grocery_latitude = current.lat;
//                $scope.signUpObject.grocery_longitude = current.lng;
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                BMapService.refreshLocation($scope.initPage.map, function (addComp) {
//                    $scope.$apply(function () {
//                        $scope.$emit(GlobalEvent.onShowLoading, false);
//                        $scope.signUpObject.grocery_address = BMapService.getAddressStrByMap(addComp);
//                        $scope.hideMap();
//
//                    });
//                });
//            };
//
//            $scope.signUp = function () {
//                //console.log($scope.signUpObject.grocery_annual_sales);
//                if ($scope.signUpObject.username.length < 11) {
//                    return $scope.$emit(GlobalEvent.onShowAlert, '必须是11位的手机号码');
//                }
//
//                if (!$scope.initPage.account && $scope.signUpObject.password.length < 6) {
//                    return $scope.$emit(GlobalEvent.onShowAlert, '密码必须大于6位数');
//                }
//
//                if ($scope.signUpObject.nickname === '') {
//                    return $scope.$emit(GlobalEvent.onShowAlert, '请输入店主名');
//                }
//
//                if ($scope.signUpObject.grocery_name === '') {
//                    return $scope.$emit(GlobalEvent.onShowAlert, '请输入店名');
//                }
//
//                if ($scope.signUpObject.grocery_area === '') {
//                    return $scope.$emit(GlobalEvent.onShowAlert, '请输入面积');
//                }
//
//                if ($scope.signUpObject.grocery_annual_sales === '') {
//                    return $scope.$emit(GlobalEvent.onShowAlert, '请输入年营业额');
//                }
//
//                if (!$scope.signUpObject.grocery_latitude || !$scope.signUpObject.grocery_longitude) {
//                    return $scope.$emit(GlobalEvent.onShowAlert, '请进行地图定位');
//                }
//
//                if ($scope.initPage.province === '' || $scope.initPage.city === '' || $scope.initPage.county === '') {
//                    return $scope.$emit(GlobalEvent.onShowAlert, '请选择地区');
//                }
//
//                $scope.signUpObject.district = $scope.initPage.province + '-' + $scope.initPage.city + '-' + $scope.initPage.county;
//
//                //if ($scope.signUpObject.grocery_photos.length === 0) {
//                //  return $scope.$emit(GlobalEvent.onShowAlert, '请上传店铺照片');
//                //}
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                if (!$scope.initPage.account) {
//                    SignService.grocerySignUp(
//                        $scope.signUpObject
//                    )
//                        .then(function (data) {
//                            console.log(data);
//                            $scope.$emit(GlobalEvent.onShowLoading, false);
//                            if (data.err) {
//                                $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                            }
//                            else if (data.error) {
//                                $scope.$emit(GlobalEvent.onShowAlert, data.error.type);
//
//                            }
//                            else {
//                                $scope.$emit(GlobalEvent.onShowAlert, '注册成功');
//                                initSignUpObject();
//                            }
//                        }, function (err) {
//                        });
//                }
//                else {
//                    $scope.signUpObject._id = $scope.initPage.account._id.toString();
//                    delete $scope.signUpObject.password;
//                    console.log('xiu gai:');
//                    console.log($scope.signUpObject);
//                    AccountServer.modifyGrocer(
//                        $scope.signUpObject
//                    )
//                        .then(function (data) {
//                            console.log(data);
//                            $scope.$emit(GlobalEvent.onShowLoading, false);
//                            if (data.err) {
//                                $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                            }
//                            else if (data.error) {
//                                $scope.$emit(GlobalEvent.onShowAlert, data.error.type);
//                            }
//                            else {
//                                $scope.$emit(GlobalEvent.onShowAlert, '修改成功');
//                                $state.go('grocersList');
//
//                            }
//                        }, function (err) {
//                        });
//                }
//
//            };
//
//            function initMap() {
//
//                $scope.initPage.map = BMapService.create('bmap', new BMap.Point(116.404, 39.915), 11, true);
//                $scope.initPage.map.addEventListener('moveend', function () {
//                    BMapService.refreshLocation($scope.initPage.map, function (addComp) {
//                        $scope.$apply(function () {
//                            $scope.initPage.search_key = BMapService.getAddressStrByMap(addComp);
//                        });
//                    });
//
//                });
//                initSearchInfo();
//
//            }
//
//            function initSearchInfo() {
//                var ac = new BMap.Autocomplete(    //建立一个自动完成的对象
//                    {
//                        'input': 'suggestId',
//                        'location': $scope.initPage.map
//                    });
//                ac.addEventListener('onhighlight', function (e) {
//                    var str = '';
//                    var _value = e.fromitem.value;
//                    var value = '';
//                    if (e.fromitem.index > -1) {
//                        value = _value.province + _value.city + _value.district + _value.street + _value.business;
//                    }
//                    str = 'FromItem<br />index = ' + e.fromitem.index + '<br />value = ' + value;
//
//                    value = '';
//                    if (e.toitem.index > -1) {
//                        _value = e.toitem.value;
//                        value = _value.province + _value.city + _value.district + _value.street + _value.business;
//                    }
//                    str += '<br />ToItem<br />index = ' + e.toitem.index + '<br />value = ' + value;
//                    getDomById('searchResultPanel').innerHTML = str;
//                });
//                var placeVal;
//                ac.addEventListener('onconfirm', function (e) {    //鼠标点击下拉列表后的事件
//                    var _value = e.item.value;
//                    placeVal = _value.province + _value.city + _value.district + _value.street + _value.business;
//                    getDomById('searchResultPanel').innerHTML = 'onconfirm<br />index = ' + e.item.index + '<br />placeVal = ' + placeVal;
//
//                    BMapService.setPlace(placeVal, $scope.initPage.map);
//                });
//            }
//
//            initAreaInfo();
//
//            getQiniuKey();
//
//            initDate();
//
//        }]);

///**
// * Created by louisha on 15/6/19.
// */
//'use strict';
//angular.module('eWeb').controller('GoodsAddController',
//    ['$scope', 'GlobalEvent', '$state', '$stateParams', 'GoodsService', 'Global', '$base64', 'QiNiuService', 'Config', 'AccountServer', '$window', '$timeout',
//        function ($scope, GlobalEvent, $state, $stateParams, GoodsService, Global, $base64, QiNiuService, Config, AccountServer, $window, $timeout) {
//
//            var isEditGoodsPage = false;
//            $scope.isCreate = !isEditGoodsPage;
//            $scope.initPage = {
//                title: '',
//                goods: null,
//                goodsCategories: [],
//                display_photos: [],
//                description_photos: [],
//                banner_photos: [],
//                qiniu_key: '',
//                sku_features_input: '',
//                provinces: [],
//                citys: [],
//                countys: [],
//                province: [],
//                city: [],
//                county: [],
//                distributor: null,
//                distributorList: [],
//                goodsTemplates: []
//            };
//            $scope.goodsObj = {
//                category: '',
//                name: '',
//                market_price: '',
//                price: '',
//                display_photos: [],
//                goods_parameters: '',
//                description: '',
//                description_photos: [],
//                recommend: 'false',
//                banner_recommend: 'false',
//                banner_photos: [],
//                sku_features: [{key: 'features', value: []}],
//                district: '',
//                self_production: 'true',
//                distributor: '',
//                source: '柱柱自营'
//            };
//
//            function getGoodsCategories() {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                GoodsService.getGoodsCategories().then(function (data) {
//                    console.log(data);
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    if (data.err) {
//                        $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                    }
//                    else {
//                        $scope.initPage.goodsCategories = data.categories;
//                        if (!$scope.initPage.goods) {
//                            $scope.goodsObj.category = $scope.initPage.goodsCategories.length > 0 ? $scope.initPage.goodsCategories[0]._id : '';
//                        }
//
//                    }
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            function getQiniuKey() {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                QiNiuService.qiNiuKey().then(function (data) {
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    console.log(data);
//                    $scope.initPage.qiniu_key = data.token;
//
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            function getDistributorListByDistrict() {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                var district = $scope.initPage.province + '-' + $scope.initPage.city + '-' + $scope.initPage.county;
//                AccountServer.getDistributorListByDistrict(district).then(function (data) {
//                    console.log(data);
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    if (data.err) {
//                        $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                    }
//                    if (data.error) {
//                        $scope.$emit(GlobalEvent.onShowAlert, data.error.type);
//                    }
//                    else {
//                        $scope.initPage.distributorList = data.distributors;
//                    }
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            function generalImgUrl(imgName) {
//                return Config.qiniuServerAddress + imgName;
//            }
//
//            function initGoodsObj() {
//                $scope.goodsObj.category = $scope.initPage.goodsCategories.length > 0 ? $scope.initPage.goodsCategories[0]._id : '';
//                $scope.goodsObj.name = '';
//                $scope.goodsObj.market_price = '';
//                $scope.goodsObj.price = '';
//                $scope.goodsObj.display_photos = [];
//                $scope.goodsObj.goods_parameters = '';
//                $scope.goodsObj.description = '';
//                $scope.goodsObj.recommend = 'false';
//                $scope.goodsObj.banner_recommend = 'false';
//                $scope.goodsObj.description_photos = [];
//                $scope.goodsObj.sku_features = [{key: 'features', value: []}];
//                $scope.goodsObj.district = '';
//                $scope.goodsObj.source = '邻里邻店自营';
//                $scope.goodsObj.distributor = '';
//                $scope.goodsObj.self_production = 'true';
//                $scope.initPage.display_photos = [];
//                $scope.initPage.description_photos = [];
//                $scope.initPage.banner_photos = [];
//                $scope.initPage.sku_features_input = '';
//                $scope.initPage.distributor = null;
//
//            }
//
//            function initGoodsImageForEdit(photos, target) {
//                for (var i = 0; i < photos.length; i++) {
//                    var obj = {
//                        img: generalImgUrl(photos[i])
//
//                    };
//                    target.push(obj);
//                }
//            }
//
//
//            function initAreaInfo() {
//                Global.getAreaInfo(function (err, area) {
//                    if (area) {
//                        initArea(area);
//                    }
//                });
//
//            }
//
//            function initArea(province) {
//                $scope.initPage.province = province[0].name;
//                $scope.initPage.city = province[0].citys[0].name;
//                $scope.initPage.county = province[0].citys[0].county[0].name;
//                getDistributorListByDistrict();
//                province.forEach(function (p) {
//                    $scope.initPage.provinces.push(p.name);
//                    p.citys.forEach(function (c) {
//                        $scope.initPage.citys.push(c.name);
//                        c.county.forEach(function (co) {
//                            $scope.initPage.countys.push(co.name);
//                        });
//                    });
//                });
//            }
//
//            function initDate() {
//                if ($stateParams.goodsId) {
//                    isEditGoodsPage = true;
//                    $scope.isCreate = false;
//                    $scope.getGoodsDetailById($stateParams.goodsId);
//                    $scope.initPage.title = '商品编辑';
//                }
//                else {
//                    $scope.initPage.title = '商品添加';
//                }
//
//            }
//
//            function start(index, target) {
//                target[index].progress = {
//                    p: 0
//                };
//                target[index].upload = QiNiuService.upload({
//                    //key: '',
//                    file: target[index].file,
//                    token: $scope.initPage.qiniu_key
//                });
//                target[index].upload.then(function (response) {
//                    console.log(response);
//                    if (target === $scope.initPage.display_photos) {
//                        $scope.goodsObj.display_photos.splice(index, 0, response.key);
//                    }
//                    else if (target === $scope.initPage.description_photos) {
//                        $scope.goodsObj.description_photos.splice(index, 0, response.key);
//                    }
//                    else if (target === $scope.initPage.banner_photos) {
//                        $scope.goodsObj.banner_photos[0] = response.key;
//                    }
//                    target[index].img = generalImgUrl(response.key);
//                }, function (response) {
//                    alert(response);
//                    console.log(response);
//                }, function (evt) {
//                    target[index].progress.p = Math.floor(100 * evt.loaded / evt.totalSize);
//                });
//            }
//
//            $scope.getGoodsDetailById = function (goodsId) {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                GoodsService.getGoodsById(goodsId).then(function (data) {
//                    console.log(data);
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    if (data.err) {
//                        $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                    }
//                    else {
//                        $scope.initPage.goods = data.goods;
//                        if ($scope.initPage.goods) {
//                            $scope.goodsObj.category = $scope.initPage.goods.categories[0]._id;
//                            $scope.goodsObj.name = $scope.initPage.goods.name || '';
//                            $scope.goodsObj.goods_parameters = $scope.initPage.goods.goods_parameters || '';
//                            $scope.goodsObj.description = $scope.initPage.goods.description || '';
//                            $scope.goodsObj.market_price = $scope.initPage.goods.market_price;
//                            $scope.goodsObj.price = $scope.initPage.goods.price;
//                            $scope.goodsObj.display_photos = $scope.initPage.goods.display_photos;
//                            $scope.goodsObj.description_photos = $scope.initPage.goods.description_photos;
//                            $scope.goodsObj.recommend = $scope.initPage.goods.recommend.toString();
//                            $scope.goodsObj.banner_recommend = $scope.initPage.goods.banner_recommend.toString();
//                            $scope.goodsObj.banner_photos = $scope.initPage.goods.banner_photos;
//                            $scope.goodsObj.district = $scope.initPage.goods.district || '';
//                            $scope.goodsObj.self_production = $scope.initPage.goods.self_production.toString();
//                            $scope.goodsObj.distributor = $scope.initPage.goods.distributor;
//                            $scope.goodsObj.source = $scope.initPage.goods.source;
//                            if ($scope.goodsObj.district !== '') {
//                                var area = $scope.initPage.goods.district.split('-');
//                                $scope.initPage.province = area[0];
//                                $scope.initPage.city = area[1];
//                                $scope.initPage.county = area[2];
//                            }
//
//                            if ($scope.initPage.goods.sku_features && $scope.initPage.goods.sku_features.length > 0) {
//                                if ($scope.initPage.goods.sku_features[0].value && $scope.initPage.goods.sku_features[0].value.length > 0) {
//                                    $scope.goodsObj.sku_features = $scope.initPage.goods.sku_features;
//                                }
//                            }
//
//                            $scope.initPage.description_photos = [];
//                            $scope.initPage.display_photos = [];
//                            $scope.initPage.banner_photos = [];
//                            initGoodsImageForEdit($scope.initPage.goods.description_photos, $scope.initPage.description_photos);
//                            initGoodsImageForEdit($scope.initPage.goods.display_photos, $scope.initPage.display_photos);
//                            initGoodsImageForEdit($scope.initPage.goods.banner_photos, $scope.initPage.banner_photos);
//
//                        }
//                    }
//                    $scope.initPage.goodsTemplates = [];
//                }, function (err) {
//                    console.log(err);
//                });
//            };
//
//            $scope.$on(GlobalEvent.onBodyClick, function () {
//                $scope.initPage.goodsTemplates = [];
//            });
//
//            $scope.getGoodsTemplatesByKeyword = function () {
//                $timeout(function () {
//                    GoodsService.getGoodsTemplateListByUser($scope.goodsObj.name, 10).then(function (data) {
//                        console.log(data);
//                        $scope.initPage.goodsTemplates = data.goods_templates;
//                    }, function (err) {
//                        console.log(err);
//                    });
//                });
//            };
//
//            $scope.abort = function (index, target) {
//                if (target[index].upload) {
//                    //待修改的，非上传图片属性不会有这个属性
//                    target[index].upload.abort();
//
//                }
//                target.splice(index, 1);
//                if (target === $scope.initPage.display_photos) {
//                    $scope.goodsObj.display_photos.splice(index, 1);
//                }
//                else if (target === $scope.initPage.description_photos) {
//                    $scope.goodsObj.description_photos.splice(index, 1);
//                }
//                else if (target === $scope.initPage.banner_photos) {
//                    $scope.goodsObj.banner_photos.splice(index, 1);
//                }
//            };
//
//            $scope.onFileSelect = function ($files, target) {
//                var offsetx = target.length;
//                if (target === $scope.initPage.banner_photos) {
//                    target[0] = {
//                        file: $files[0]
//                    };
//                    start(0, target);
//                }
//                else {
//                    for (var i = 0; i < $files.length; i++) {
//                        target[i + offsetx] = {
//                            file: $files[i]
//                        };
//                        start(i + offsetx, target);
//                    }
//                }
//
//            };
//
//            $scope.getCategoryName = function (categorys) {
//                return GoodsService.getCategoryName(categorys);
//            };
//
//            $scope.skuFeaturesAdd = function () {
//                //sku_features: [{key: '香味', value: ['苹果香','柠檬酸','薄荷凉','香橙甜']}],
//                if ($scope.initPage.sku_features_input === '') {
//                    return;
//                }
//                //var _index = $scope.goodsObj.sku_features.length;
//                //var _key = 'sku_features_' + _index;
//                //var obj = {key: _key, value: [$scope.initPage.sku_features_input]};
//                //$scope.goodsObj.sku_features[0].value.push(obj);
//                $scope.goodsObj.sku_features[0].value.push($scope.initPage.sku_features_input);
//                $scope.initPage.sku_features_input = '';
//            };
//
//            $scope.skuFeaturesRemove = function (index) {
//                $scope.goodsObj.sku_features[0].value.splice(index, 1);
//            };
//
//            function generateDistrcit(province, city, county) {
//                return province + '-' + city + '-' + county;
//            }
//
//            function goodsParamValid(callback) {
//                if ($scope.goodsObj.name === '') {
//                    return callback('请输入商品名称');
//                }
//
//                if ($scope.isCreate && $scope.goodsObj.market_price === '') {
//                    return callback('请输入商品价格');
//                }
//
//                if ($scope.goodsObj.display_photos.length === 0) {
//                    return callback('请至少选择一张展示图片');
//                }
//
//                if ($scope.goodsObj.description_photos.length === 0) {
//                    return callback('请至少选择一张商品图片');
//                }
//
//                if ($scope.goodsObj.banner_recommend === 'true' && $scope.goodsObj.banner_photos.length === 0) {
//                    return callback('请选择一张banner推荐照片');
//                }
//
//                if ($scope.initPage.province === '' || $scope.initPage.city === '' || $scope.initPage.county === '') {
//                    return callback('请选择地区');
//                }
//
//                if ($scope.goodsObj.self_production === 'false' && !$scope.goodsObj.distributor) {
//                    return callback('请选择合作商');
//                }
//
//                return callback();
//            }
//
//            function prepareSubmitGoods() {
//                $scope.goodsObj.district = generateDistrcit($scope.initPage.province, $scope.initPage.city, $scope.initPage.county);
//                $scope.goodsObj.name = $window.encodeURI($scope.goodsObj.name, 'UTF-8');
//                $scope.goodsObj.goods_parameters = $window.encodeURI($scope.goodsObj.goods_parameters, 'UTF-8');
//                $scope.goodsObj.description = $window.encodeURI($scope.goodsObj.description, 'UTF-8');
//                if ($scope.goodsObj.banner_recommend !== 'true' && $scope.goodsObj.banner_recommend !== true && $scope.goodsObj.banner_photos.length > 0) {
//                    $scope.goodsObj.banner_photos = [];
//                    $scope.initPage.banner_photos = [];
//                }
//
//                if ($scope.initPage.distributor) {
//                    var obj = JSON.parse($scope.initPage.distributor);
//                    if (obj) {
//                        $scope.goodsObj.source = obj.name;
//                        $scope.goodsObj.distributor = obj._id;
//                    }
//                }
//            }
//
//            function createNewGoods(callback) {
//                GoodsService.createGoods($scope.goodsObj).then(function (data) {
//                    console.log(data);
//                    if (data.err) {
//                        return callback(data.err);
//                    }
//                    else if (data.error) {
//                        return callback(data.error);
//                    }
//                    else {
//                        return callback();
//                    }
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            function editGoods(callback) {
//                GoodsService.updateGoods($scope.initPage.goods._id, $scope.goodsObj).then(function (data) {
//                    console.log(data);
//                    if (data.err) {
//                        return callback(data.err);
//                    }
//                    else if (data.error) {
//                        return callback(data.error);
//                    }
//
//                    return callback();
//
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            $scope.submitNewGoods = function () {
//                goodsParamValid(function (err) {
//                    if (err) {
//                        return $scope.$emit(GlobalEvent.onShowAlert, err);
//                    } else {
//
//                        prepareSubmitGoods();
//
//                        $scope.$emit(GlobalEvent.onShowLoading, true);
//                        if (isEditGoodsPage) {
//                            editGoods(function (err) {
//                                $scope.$emit(GlobalEvent.onShowLoading, false);
//                                if (err) {
//                                    console.log(err);
//                                    return $scope.$emit(GlobalEvent.onShowAlert, err.type);
//                                } else {
//                                    $scope.$emit(GlobalEvent.onShowAlert, '商品编辑成功');
//                                    $state.go('goodsList');
//                                }
//                            });
//                        }
//                        else {
//                            createNewGoods(function (err) {
//                                $scope.$emit(GlobalEvent.onShowLoading, false);
//                                if (err) {
//                                    return $scope.$emit(GlobalEvent.onShowAlert, err.type);
//                                } else {
//                                    initGoodsObj();
//                                    return $scope.$emit(GlobalEvent.onShowAlert, '商品添加成功');
//                                }
//                            });
//                        }
//                    }
//                });
//            };
//
//            $scope.updateDistributorList = function () {
//                getDistributorListByDistrict();
//            };
//
//            getGoodsCategories();
//            getQiniuKey();
//            initAreaInfo();
//            initDate();
//        }]);

///**
// * Created by louisha on 15/6/19.
// */
//'use strict';
//angular.module('eWeb').controller('GoodsListController',
//    ['$scope', 'GlobalEvent', '$state', 'GoodsService',
//        function ($scope, GlobalEvent, $state, GoodsService) {
//            $scope.initPage = {
//                goods_list: [],
//                goodsCategories: [],
//                search:{
//                    category: '',
//                    goodsName:''
//                },
//                pagination: {
//                    currentPage: 1,
//                    limit: 10,
//                    totalCount: 0,
//                    pageCount: 0,
//                    pageNavigationCount: 5,
//                    canSeekPage: true,
//                    limitArray: [10, 20, 30, 40, 100],
//                    pageList: [],
//                    onCurrentPageChanged: function (callback) {
//                        console.log('current page changed');
//                        getGoodsList();
//                    }
//                }
//            };
//
//            function getGoodsCategories() {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                GoodsService.getGoodsCategories().then(function (data) {
//                    console.log(data);
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    if (data.err) {
//                        $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                    }
//                    else {
//                        $scope.initPage.goodsCategories = data.categories;
//
//                    }
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            function updatePaginationConfig(totalCount, limit){
//                $scope.initPage.pagination.totalCount = totalCount;
//                $scope.initPage.pagination.limit = limit;
//                $scope.initPage.pagination.pageCount = Math.ceil(totalCount / limit);
//                $scope.initPage.pagination.render();
//            }
//
//            function getGoodsList() {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                GoodsService.getGoodsListByCondition($scope.initPage.pagination.currentPage, $scope.initPage.pagination.limit, $scope.initPage.search).then(function (data) {
//                    console.log(data);
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    if (data.err) {
//                        $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                    }
//                    else {
//                        $scope.initPage.goods_list = data.goods_list;
//                        updatePaginationConfig(data.total_count, data.limit);
//                    }
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            $scope.onSearchClick = function(){
//                getGoodsList();
//            };
//
//            $scope.getCategoryName = function (categorys) {
//                return GoodsService.getCategoryName(categorys);
//            };
//
//            $scope.addGoods = function () {
//                $state.go('goodsAdd');
//            };
//
//            $scope.onEditGoods = function (goods) {
//                $state.go('goodsAdd', {goodsId: goods._id});
//            };
//            $scope.onDeleteGoods = function (goodsId) {
//
//                $scope.$emit(GlobalEvent.onShowAlertConfirm, {info: '是否确认删除？'}, function () {
//                    $scope.$emit(GlobalEvent.onShowLoading, true);
//                    GoodsService.deleteGoods(goodsId).then(function (data) {
//                        console.log(data);
//                        $scope.$emit(GlobalEvent.onShowLoading, false);
//                        if (data.err) {
//                            $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                        }
//                        if (data.error) {
//                            $scope.$emit(GlobalEvent.onShowAlert, data.error.type);
//                        }
//                        else {
//                            $scope.$emit(GlobalEvent.onShowAlert, '删除成功');
//                            getGoodsList();
//                        }
//                    }, function (err) {
//                        console.log(err);
//                    });
//                });
//
//            };
//
//            getGoodsCategories();
//            getGoodsList();
//        }]);

/**
 * Created by elinaguo on 16/3/16.
 */
'use strict';
angular.module('EWeb').controller('GoodsManagerController',
  ['$scope', '$stateParams', '$window', '$rootScope',  'GlobalEvent', '$state', 'GoodsService',
    function ($scope, $stateParams, $window, $rootScope, GlobalEvent, $state, GoodsService) {

      $scope.pageConfig = {
        title: '',
        type: '',
        currentTag: 'goods',
        scanType: '',
        goodsPanel: {
          currentEditGoods: null,
          pagination: {
            currentPage: 1,
            limit: 10,
            totalCount: 0
          },
          errorInfo: {
            name: false,
            display_photos: false,
            price: false
          },
          goodsList: []
        },
        orderPanel: {
          pagination: {
            currentPage: 1,
            limit: 10,
            totalCount: 0
          },
          orderList: []
        },
        panel: {
          showMask: false,
          showGoodsEdit: false,
          showOrderEdit: false,
          showGoodsScan: false,
          showOrderScan: false
        }
      };

      $scope.goBack = function () {
        $state.go('user_index');
      };

      $scope.changeTag = function(tagName){
        $scope.pageConfig.currentTag = tagName;
      };

      function initPageConfig(){
        switch($stateParams.goods_type){
          case 'goods':
            $scope.pageConfig.title = '超市管理';
            $scope.pageConfig.type = 'supermarket';
            return;
          case 'dish':
            $scope.pageConfig.title = '餐厅管理';
            $scope.pageConfig.type = 'restaurant';
            return;
          default:
            $scope.pageConfig.title = '餐厅管理';
            $scope.pageConfig.type = 'restaurant';
            return;
        }
      }

      function getGoodsList(){

      }

      function getNewGoodsObj(){
        return {
          name: '',
          description: '',
          status: 'none',
          price: 0,
          discount: 1,
          display_photos: [],
          description_photos: []
        };
      }

      $scope.clearMask = function(){
        $scope.pageConfig.panel.showMask = false;
        $scope.pageConfig.panel.showGoodsEdit = false;
        $scope.pageConfig.panel.showOrderEdit = false;
        $scope.pageConfig.panel.showGoodsScan = false;
        $scope.pageConfig.panel.showOrderScan = false;
      };

      $scope.showEditGoodsPanel = function(goods){
        $scope.pageConfig.panel.showGoodsEdit = true;
        $scope.pageConfig.panel.showMask = true;
        if(!goods){
          $scope.pageConfig.goodsPanel.currentEditGoods = getNewGoodsObj();
        }
      };

      function validGoodsInfo(){
        var isValid = true;
        if(!$scope.pageConfig.goodsPanel.currentEditGoods.name){
          $scope.pageConfig.goodsPanel.errorInfo.name = true;
          isValid = false;
        }

        if(!$scope.pageConfig.goodsPanel.currentEditGoods.price || parseInt($scope.pageConfig.goodsPanel.currentEditGoods.price) < 0){
          $scope.pageConfig.goodsPanel.errorInfo.price = true;
          isValid = false;
        }

        if(!$scope.pageConfig.goodsPanel.currentEditGoods.display_photos || $scope.pageConfig.goodsPanel.currentEditGoods.display_photos.length === 0){
          $scope.pageConfig.goodsPanel.errorInfo.display_photos = true;
          isValid = false;
        }

        return isValid;
      }

      $scope.createOrEditGoods = function(isCreate){
        if(!validGoodsInfo()){
          return;
        }

        //if(isCreate){
        //  GoodsService.createGoods($scope.pageConfig.goodsPanel.currentEditGoods, function(err, data){
        //    if(err){
        //
        //    }
        //
        //
        //  });
        //}else{
        //  GoodsService.modifyGoods($scope.pageConfig.goodsPanel.currentEditGoods, function(err, data){
        //    if(err){
        //
        //    }
        //
        //
        //  });
        //}
      };

      $scope.translateGoodsStatus = function(status){
        return GoodsService.translateGoodsStatus(status);
      };

      function init(){
        initPageConfig();
      }

      init();
    }]);

///**
// * Created by louisha on 15/8/18.
// */
//'use strict';
//angular.module('eWeb').controller('GoodsTemplateController',
//    [
//        '$scope',
//        'GlobalEvent',
//        '$state',
//        '$stateParams',
//        'GoodsService',
//        'QiNiuService',
//        'Config',
//        'AccountServer',
//        '$window',
//        function ($scope,
//                  GlobalEvent,
//                  $state,
//                  $stateParams,
//                  GoodsService,
//                  QiNiuService,
//                  Config,
//                  AccountServer,
//                  $window) {
//            $scope.initPage = {
//                title: '',
//                goodsCategories: [],
//                display_photos: [],
//                description_photos: [],
//                category: '',
//                qiniu_key: '',
//                isEditGoodsPage: false
//            };
//            $scope.goodsObj = {
//                categories: [],
//                brand: '',
//                name: '',
//                display_photos: [],
//                description_photos: [],
//                goods_parameters: ''
//            };
//
//            function getGoodsCategories() {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                GoodsService.getGoodsCategories().then(function (data) {
//                    console.log(data);
//                    if (data.err) {
//                        return $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                    }
//                    if (data.error) {
//                        return $scope.$emit(GlobalEvent.onShowAlert, data.error.type);
//                    }
//                    $scope.initPage.goodsCategories = data.categories;
//                    if (!$scope.initPage.isEditGoodsPage) {
//                        $scope.initPage.category = $scope.initPage.goodsCategories.length > 0 ? $scope.initPage.goodsCategories[0]._id : '';
//                    }
//
//                    getQiniuKey();
//
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            function getGoodsDetailById(goodsId) {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                GoodsService.goodsTemplateById(goodsId, function (err, data) {
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    if (err) {
//                        return $scope.$emit(GlobalEvent.onShowAlert, err.type);
//                    }
//                    $scope.goodsObj.name = data.name || '';
//                    $scope.goodsObj.brand = data.brand ? data.brand.name : '';
//                    $scope.goodsObj.goods_parameters = data.goods_parameters || '';
//                    $scope.goodsObj.categories = data.categories;
//                    $scope.initPage.category = data.categories[0];
//                    $scope.goodsObj.display_photos = data.display_photos;
//                    $scope.goodsObj.description_photos = data.description_photos;
//                    $scope.initPage.display_photos = [];
//                    $scope.initPage.description_photos = [];
//                    initGoodsImageForEdit(data.description_photos, $scope.initPage.description_photos);
//                    initGoodsImageForEdit(data.display_photos, $scope.initPage.display_photos);
//                });
//            }
//
//            function initGoodsImageForEdit(photos, target) {
//                for (var i = 0; i < photos.length; i++) {
//                    var obj = {
//                        img: generalImgUrl(photos[i])
//
//                    };
//                    target.push(obj);
//                }
//            }
//
//
//            function getQiniuKey() {
//                QiNiuService.qiNiuKey().then(function (data) {
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    console.log(data);
//                    if (!data) {
//                        return $scope.$emit(GlobalEvent.onShowAlert, '获取七牛上传凭证失败，请刷新网页');
//                    }
//                    if (data.err) {
//                        return $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                    }
//                    if (data.error) {
//                        return $scope.$emit(GlobalEvent.onShowAlert, data.error.type);
//                    }
//                    $scope.initPage.qiniu_key = data.token;
//
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            function generalImgUrl(imgName) {
//                return Config.qiniuServerAddress + imgName;
//            }
//
//            function initGoodsObj() {
//                $scope.initPage.category = $scope.initPage.goodsCategories.length > 0 ? $scope.initPage.goodsCategories[0]._id : '';
//                $scope.goodsObj.categories = [];
//                $scope.goodsObj.name = '';
//                $scope.goodsObj.brand = '';
//                $scope.goodsObj.display_photos = [];
//                $scope.goodsObj.description_photos = [];
//                $scope.goodsObj.goods_parameters = '';
//                $scope.initPage.display_photos = [];
//                $scope.initPage.goods_parameters = [];
//            }
//
//
//            function fileUploadStart(index, target) {
//                target[index].progress = {
//                    p: 0
//                };
//                target[index].upload = QiNiuService.upload({
//                    //key: '',
//                    file: target[index].file,
//                    token: $scope.initPage.qiniu_key
//                });
//                target[index].upload.then(function (response) {
//                    console.log(response);
//                    if (target === $scope.initPage.display_photos) {
//                        $scope.goodsObj.display_photos.splice(index, 0, response.key);
//                    }
//                    else if (target === $scope.initPage.description_photos) {
//                        $scope.goodsObj.description_photos.splice(index, 0, response.key);
//                    }
//                    target[index].img = generalImgUrl(response.key);
//                }, function (response) {
//                    alert(response);
//                    console.log(response);
//                }, function (evt) {
//                    target[index].progress.p = Math.floor(100 * evt.loaded / evt.totalSize);
//                });
//            }
//
//            $scope.imgAbort = function (index, target) {
//                if ($scope.initPage[target][index].upload) {
//                    //待修改的，非上传图片属性不会有这个属性
//                    $scope.initPage[target][index].upload.abort();
//                }
//                $scope.initPage[target].splice(index, 1);
//                $scope.goodsObj[target].splice(index, 1);
//
//            };
//
//            $scope.onFileSelect = function ($files, target) {
//                var offsetx = target.length;
//                for (var i = 0; i < $files.length; i++) {
//                    target[i + offsetx] = {
//                        file: $files[i]
//                    };
//                    fileUploadStart(i + offsetx, target);
//                }
//
//            };
//
//            $scope.getCategoryName = function (categorys) {
//                return GoodsService.getCategoryName(categorys);
//            };
//
//            function goodsParamValid(callback) {
//                if ($scope.goodsObj.name === '') {
//                    return callback('请输入商品名称');
//                }
//                if ($scope.goodsObj.display_photos.length === 0) {
//                    return callback('请至少选择一张商品图片');
//                }
//                return callback();
//            }
//
//            function prepareSubmitGoods() {
//                $scope.goodsObj.name = $window.encodeURI($scope.goodsObj.name, 'UTF-8');
//                $scope.goodsObj.brand = $window.encodeURI($scope.goodsObj.brand, 'UTF-8');
//                $scope.goodsObj.goods_parameters = $window.encodeURI($scope.goodsObj.goods_parameters, 'UTF-8');
//                $scope.goodsObj.categories = [];
//                $scope.goodsObj.categories.push($scope.initPage.category);
//            }
//
//            $scope.submitGoods = function () {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                goodsParamValid(function (err) {
//                    if (err) {
//                        $scope.$emit(GlobalEvent.onShowLoading, false);
//                        return $scope.$emit(GlobalEvent.onShowAlert, err);
//                    } else {
//                        prepareSubmitGoods();
//                        if (!$scope.initPage.isEditGoodsPage) {
//                            GoodsService.createGoodsTemplate($scope.goodsObj, function (err, data) {
//                                $scope.$emit(GlobalEvent.onShowLoading, false);
//                                if (err) {
//                                    return $scope.$emit(GlobalEvent.onShowAlert, err.type);
//                                }
//                                initGoodsObj();
//                                return $scope.$emit(GlobalEvent.onShowAlert, '添加成功');
//                            });
//                        }
//                        else {
//                            GoodsService.goodsTemplateUpdate($stateParams.goodsId, $scope.goodsObj, function (err, data) {
//                                $scope.$emit(GlobalEvent.onShowLoading, false);
//                                if (err) {
//                                    return $scope.$emit(GlobalEvent.onShowAlert, err.type);
//                                }
//                                $scope.$emit(GlobalEvent.onShowAlert, '编辑成功');
//                                $state.go('goodsTemplateList');
//                            });
//                        }
//
//                    }
//                });
//            };
//
//            function initDate() {
//                getGoodsCategories();
//                if ($stateParams.goodsId) {
//                    $scope.initPage.isEditGoodsPage = true;
//                    getGoodsDetailById($stateParams.goodsId);
//                    $scope.initPage.title = '商品模板编辑';
//                }
//                else {
//                    $scope.initPage.title = '商品模板添加';
//                }
//            }
//
//            initDate();
//        }]);

///**
// * Created by louisha on 15/6/19.
// */
//'use strict';
//angular.module('eWeb').controller('GoodsTemplateListController',
//    ['$scope', 'GlobalEvent', '$state', 'GoodsService',
//        function ($scope, GlobalEvent, $state, GoodsService) {
//            $scope.initPage = {
//                goods_list: [],
//                goodsCategories: [],
//                search: {
//                    category: '',
//                    goodsName: ''
//                },
//                pagination: {
//                    currentPage: 1,
//                    limit: 10,
//                    totalCount: 0,
//                    pageCount: 0,
//                    pageNavigationCount: 5,
//                    canSeekPage: true,
//                    limitArray: [10, 20, 30, 40, 100],
//                    pageList: [],
//                    onCurrentPageChanged: function (callback) {
//                        console.log('current page changed');
//                        getGoodsList();
//                    }
//                }
//            };
//
//
//            function updatePaginationConfig(totalCount, limit) {
//                $scope.initPage.pagination.totalCount = totalCount;
//                $scope.initPage.pagination.limit = limit;
//                $scope.initPage.pagination.pageCount = Math.ceil(totalCount / limit);
//                $scope.initPage.pagination.render();
//            }
//
//            function getGoodsCategories() {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                GoodsService.getGoodsCategories().then(function (data) {
//                    console.log(data);
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    if (data.err) {
//                        $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                    }
//                    else {
//                        $scope.initPage.goodsCategories = data.categories;
//                        getGoodsList();
//
//                    }
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            function getGoodsList() {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                GoodsService.getGoodsTemplateList({
//                    goods_name: $scope.initPage.search.goodsName,
//                    category: $scope.initPage.search.category,
//                    current_page: $scope.initPage.pagination.currentPage,
//                    limit: $scope.initPage.pagination.limit
//                }, function (err, data) {
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    if (err) {
//                        return $scope.$emit(GlobalEvent.onShowAlert, err.type);
//                    }
//                    $scope.initPage.goods_list = data.goods_template_info_list;
//                    updatePaginationConfig(data.total_count, data.limit);
//                });
//            }
//
//
//            $scope.onSearchClick = function () {
//                getGoodsList();
//            };
//
//            $scope.getCategoryNameById = function (categoryId) {
//                for (var i = 0; i < $scope.initPage.goodsCategories.length; i++) {
//                    if ($scope.initPage.goodsCategories[i]._id === categoryId) {
//                        return $scope.initPage.goodsCategories[i].name;
//                    }
//                }
//                return '';
//            };
//
//            $scope.addGoodsTemplate = function () {
//                $state.go('goodsTemplate');
//            };
//
//
//            $scope.onEditGoods = function (goods) {
//                $state.go('goodsTemplate', {goodsId: goods._id});
//            };
//
//            $scope.onDeleteGoods = function (goodsId) {
//
//                $scope.$emit(GlobalEvent.onShowAlertConfirm, {info: '是否确认删除该商品模板？'}, function () {
//                    $scope.$emit(GlobalEvent.onShowLoading, true);
//                    GoodsService.goodsTemplateDelete(goodsId, function (err, data) {
//                        $scope.$emit(GlobalEvent.onShowLoading, false);
//                        if (err) {
//                            return $scope.$emit(GlobalEvent.onShowAlert, err.type);
//                        }
//                        $scope.$emit(GlobalEvent.onShowAlert, '删除成功');
//                        getGoodsList();
//                    });
//
//                });
//            };
//            getGoodsCategories();
//        }]);

///**
// * Created by louisha on 15/7/8.
// */
//'use strict';
//angular.module('eWeb').controller('OrderListController',
//    ['$rootScope', '$scope', 'GlobalEvent', 'OrderService', 'Global',
//        function ($rootScope, $scope, GlobalEvent, OrderService, Global) {
//
//            $scope.initPage = {
//                orderList: [],
//                pagination: {
//                    currentPage: 1,
//                    limit: 10,
//                    totalCount: 0,
//                    pageCount: 0,
//                    pageNavigationCount: 5,
//                    canSeekPage: false,
//                    limitArray: [10, 20, 30, 40, 100],
//                    pageList: [],
//                    onCurrentPageChanged: function () {
//                        console.log('current page changed');
//                        getOrderList();
//                    }
//                }
//            };
//
//
//            function updatePaginationConfig(totalCount, limit){
//                $scope.initPage.pagination.totalCount = totalCount;
//                $scope.initPage.pagination.limit = limit;
//                $scope.initPage.pagination.pageCount = Math.ceil(totalCount / limit);
//                $scope.initPage.pagination.render();
//            }
//
//            function getOrderList() {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                OrderService.getGrocerOrderList($scope.initPage.pagination.currentPage, $scope.initPage.pagination.limit, $scope.initPage.searchKey).then(function (data) {
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    console.log(data);
//                    if (data.err) {
//                        $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                    }
//                    else {
//                        $scope.initPage.orderList = data.grocer_orders;
//                        updatePaginationConfig(data.total_count, data.limit);
//                    }
//
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            getOrderList();
//        }]);

/**
* Created by louisha on 15/6/19.
*/
'use strict';
angular.module('EWeb').controller('UserSignInController',
  ['$rootScope', '$scope', 'GlobalEvent', '$state', 'UserService',
    function ($rootScope, $scope, GlobalEvent, $state, UserService) {

      $scope.signInObject = {
        username: '',
        password: ''
      };
      $scope.signIn = function () {
        if ($scope.signInObject.username === '') {
          $scope.$emit(GlobalEvent.onShowAlert, '请输入用户名');
          return;
        }
        if ($scope.signInObject.password === '') {
          $scope.$emit(GlobalEvent.onShowAlert, '请输入密码');
          return;
        }

        UserService.signIn($scope.signInObject, function(err, user){
          if (err) {
            $scope.$emit(GlobalEvent.onShowAlert, err);
            return;
          }

          if(!user){
            $scope.$emit(GlobalEvent.onShowAlert, '用户获取信息失败');
            return;
          }


          $state.go('user_index');
        });
      };
    }]);

/**
* Created by louisha on 15/6/19.
*/
'use strict';
angular.module('EWeb').controller('UserSignUpController',
  [ '$scope',
    'GlobalEvent',
    'UserService',
    function ($scope, GlobalEvent, UserService) {
      $scope.pageInfo = {
        title: '服务员注册',
        roles: [{key: 'waiter', value: '餐厅服务员'}, {key: 'cashier', value: '超市收银员'}, {key: 'card_manager', value: '饭卡充值员'}],
        groupList: []
      };
      $scope.signUpObject = {
        username: '',
        password: '',
        role: 'waiter',
        nickname: '',
        group_id: '',
        sex: 'male',
        mobile_phone: '',
        head_photo: ''
      };

      function initSignUpObject() {
        $scope.signUpObject.username = '';
        $scope.signUpObject.password = '';
        $scope.signUpObject.nickname = '';
        $scope.signUpObject.group_id = '';
        $scope.signUpObject.sex = '';
        $scope.signUpObject.role = 'waiter';
      }

      $scope.signUp = function () {
        if ($scope.signUpObject.username.length < 11) {
          return $scope.$emit(GlobalEvent.onShowAlert, '必须是11位的手机号码');
        }

        if ($scope.signUpObject.password.length < 6) {
          return $scope.$emit(GlobalEvent.onShowAlert, '密码必须大于6位数');
        }

        if ($scope.signUpObject.nickname === '') {
          return $scope.$emit(GlobalEvent.onShowAlert, '请输入姓名');
        }

        if ($scope.signUpObject.group_id === '') {
          return $scope.$emit(GlobalEvent.onShowAlert, '请选择所属医院');
        }

        $scope.$emit(GlobalEvent.onShowLoading, true);
        UserService.signUp($scope.signUpObject, function (err, data) {
          console.log(data);
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err) {
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          $scope.$emit(GlobalEvent.onShowAlert, '注册成功');
          initSignUpObject();
        });

      };

      function init() {
        $scope.$emit(GlobalEvent.onShowLoading, true);
        UserService.getGroups({currentPage: 1,limit: -1, skipCount: 0}, function (err, data) {
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err) {
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }
          $scope.pageInfo.groupList = data.group_list;
        });
      }

      init();
    }]);

/**
 * Created by elinaguo on 16/3/14.
 */
'use strict';
angular.module('EWeb').controller('UserIndexController',
  ['$window', '$rootScope', '$scope', 'GlobalEvent', '$state', 'UserService',
    function ($window, $rootScope, $scope, GlobalEvent, $state, UserService) {

      $scope.pageConfig = {
        groupList: []
      };

      $scope.goBack = function () {
        $window.history.back();
      };


      $scope.goToView = function(state){
        if(!state){
          return;
        }

        switch(state){
          case 'user_manager':
            return $state.go('user_manager');
          case 'restaurant':
            $state.go('goods_manager', {goods_type: 'dish'});
            return;
          case 'supermarket':
            $state.go('goods_manager', {goods_type: 'goods'});
            return;
          default:
            return;
        }
      };
      function init(){
        $scope.$emit(GlobalEvent.onShowLoading, true);
        UserService.getGroups({currentPage: 1,limit: -1, skipCount: 0}, function (err, data) {
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err) {
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }
          $scope.pageConfig.groupList = data.group_list;
          console.log($scope.pageConfig.groupList);
        });
      }

      init();
    }]);

/**
 * Created by elinaguo on 16/3/16.
 */
'use strict';
angular.module('EWeb').controller('UserManagerController',
  ['$window', '$rootScope', '$scope', 'GlobalEvent', '$state', 'UserService', 'UserError',
    function ($window, $rootScope, $scope, GlobalEvent, $state, UserService, UserError) {

      $scope.pageConfig = {
        roles: [{id: 'waiter', text: '服务员'},{id: 'cashier', text: '收银员'},{id:'card_manager',text:'饭卡管理员'}],
        groups: [],
        sexs: [{id: 'male', text: '男'},{id: 'female', text: '女'}],
        currentTag: 'platform-user',
        groupList: [{id: '', text: '餐厅'},{id: '', text: ''}],
        popMaskShow: false,
        plat_user_panel: {
          users: [],
          currentEditUser: null,
          errorInfo: {
            username: false,
            password: false,
            nickname: false,
            group: false,
            mobile_phone: false,
            role: false
          },
          pagination: {
            currentPage: 1,
            limit: 5,
            totalCount: 0,
            isShowTotalInfo: true,
            onCurrentPageChanged: function (callback) {
              loadUsers();
            }
          }
        },
        users: [],
        client_users:[]
      };

      $scope.goBack = function () {
        $window.history.back();
      };

      $scope.changeTag = function(tagName){
        $scope.pageConfig.currentTag = tagName;
      };

      $scope.scanUser = function(user){
        $scope.pageConfig.popMaskShow = true;
        $scope.pageConfig.scanType = 'scan';
        $scope.pageConfig.plat_user_panel.currentEditUser = user;
      };

      $scope.closePopMask = function(){
        $scope.pageConfig.popMaskShow = false;
        $scope.pageConfig.scanType = '';
      };

      function getNewUserObj(){
        return {
          username: '',
          password: '',
          nickname: '',
          mobile_phone: '',
          group: null,
          role: null
        };
      }

      $scope.editUser = function(user){
        if(!user){
          $scope.pageConfig.plat_user_panel.currentEditUser = getNewUserObj();

          $scope.pageConfig.scanType = 'create';
        }else{
          $scope.pageConfig.plat_user_panel.currentEditUser = user;
          $scope.pageConfig.scanType = 'edit';
        }
        $scope.pageConfig.popMaskShow = true;
        $scope.pageConfig.addPanel = true;
      };

      $scope.deleteUser = function(user){
        $scope.$emit(GlobalEvent.onShowLoading, true);
        UserService.deleteUser(user._id, function(err, user){

          $scope.$emit(GlobalEvent.onShowLoading, false);
          if(err){
            $scope.$emit(GlobalEvent.onShowAlert, UserError[err]||err);
          }

          $scope.$emit(GlobalEvent.onShowAlert, '删除成功！');
          $state.reload();
        });
      };
      function validUserInfo(user){
        var isPassed = true;
        if(!user.username){
          $scope.pageConfig.plat_user_panel.errorInfo.username = true;
          isPassed = false;
        }
        if(!user.password || user.password.length <6){
          $scope.pageConfig.plat_user_panel.errorInfo.password = true;
          isPassed = false;
        }
        if(!user.nickname){
          $scope.pageConfig.plat_user_panel.errorInfo.nickname = true;
          isPassed = false;
        }
        if(!user.mobile_phone){
          $scope.pageConfig.plat_user_panel.errorInfo.mobile_photo = true;
          isPassed = false;
        }
        if(!user.group){
          $scope.pageConfig.plat_user_panel.errorInfo.group = true;
          isPassed = false;
        }
        if(!user.role){
          $scope.pageConfig.plat_user_panel.errorInfo.role = true;
          isPassed = false;
        }
        return isPassed;
      }

      function clearError(){
        $scope.pageConfig.plat_user_panel.errorInfo.username = false;
        $scope.pageConfig.plat_user_panel.errorInfo.password = false;
        $scope.pageConfig.plat_user_panel.errorInfo.nickname = false;
        $scope.pageConfig.plat_user_panel.errorInfo.mobile_phone = false;
        $scope.pageConfig.plat_user_panel.errorInfo.group = false;
        $scope.pageConfig.plat_user_panel.errorInfo.role = false;
      }

      function getIndexOfUsers(username){
        for(var i=0;i<$scope.pageConfig.plat_user_panel.users.length;i++){
          if($scope.pageConfig.plat_user_panel.users[i].username === username){
            return i;
          }
        }
        return -1;
      }
      $scope.addOrEditUser = function(){
        $scope.$emit(GlobalEvent.onShowLoading, true);
        if(!validUserInfo($scope.pageConfig.plat_user_panel.currentEditUser)){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          return;
        }

        var index = getIndexOfUsers($scope.pageConfig.plat_user_panel.currentEditUser.username);
        var param;

        if($scope.pageConfig.scanType === 'create' && index > -1){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          $scope.$emit(GlobalEvent.onShowAlert, '该用户名已存在，请更换用户名');
          return;
        }
        param = {
          username: $scope.pageConfig.plat_user_panel.currentEditUser.username,
          password: $scope.pageConfig.plat_user_panel.currentEditUser.password,
          role: $scope.pageConfig.plat_user_panel.currentEditUser.role.id,
          nickname: $scope.pageConfig.plat_user_panel.currentEditUser.nickname,
          group_id: $scope.pageConfig.plat_user_panel.currentEditUser.group.id,
          sex: $scope.pageConfig.plat_user_panel.currentEditUser.sex ? $scope.pageConfig.plat_user_panel.currentEditUser.sex.id : '',
          mobile_phone: $scope.pageConfig.plat_user_panel.currentEditUser.mobile_phone,
          head_photo: ''
        };
        if($scope.pageConfig.scanType === 'create'){

          UserService.signUp(param, function(err, data){
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if (err) {
              return $scope.$emit(GlobalEvent.onShowAlert, UserError[err] || err);
            }

            clearError();
            $scope.closePopMask();
            $scope.$emit(GlobalEvent.onShowAlert, '添加成功');
            $state.reload();
          });
        }else{

          UserService.modifyUser(param, function(err, data){
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if (err) {
              return $scope.$emit(GlobalEvent.onShowAlert, UserError[err] || err);
            }

            clearError();
            $scope.closePopMask();
            $scope.$emit(GlobalEvent.onShowAlert, '修改成功');
            $state.reload();
          });
        }
      };

      $scope.reset = function(){
        $scope.pageConfig.plat_user_panel.currentEditUser = getNewUserObj();
        clearError();
      };

      $scope.cancel = function(){
        $scope.pageConfig.popMaskShow = false;
        $scope.pageConfig.scanType = '';
        clearError();
      };

      function loadUsers(){
        $scope.pageConfig.plat_user_panel.users = [];
        UserService.getUsers($scope.pageConfig.plat_user_panel.pagination,function(err, data){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err) {
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          data.users.forEach(function(user){
            $scope.pageConfig.plat_user_panel.users.push({
              _id: user._id,
              username: user.username,
              password: user.password,
              nickname: user.nickname,
              sex: user.sex === 'male' ? {id: user.sex, text: '男'} : (user.sex === 'female' ? {id: user.sex, text: '女'}: null),
              group: {id: user.group._id, text: user.group.name},
              role: user.role ? {id: user.role, text: UserService.translateUserRole(user.role)} : null,
              mobile_phone: user.mobile_phone
            });
          });

          $scope.pageConfig.plat_user_panel.pagination.totalCount = data.total_count;
          $scope.pageConfig.plat_user_panel.pagination.limit = data.limit;
          $scope.pageConfig.plat_user_panel.pagination.pageCount = Math.ceil($scope.pageConfig.plat_user_panel.pagination.totalCount / $scope.pageConfig.plat_user_panel.pagination.limit);

        });
      }

      function init(){
        $scope.$emit(GlobalEvent.onShowLoading, true);
        UserService.getGroups({currentPage: 1,limit: -1, skipCount: 0}, function (err, data) {
          if (err) {
            $scope.$emit(GlobalEvent.onShowLoading, false);
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          data.group_list.forEach(function(group){
            $scope.pageConfig.groups.push({id: group._id, text: group.name});
          });

          loadUsers();
        });
      }

      init();
    }]);

/**
 * Created by louisha on 15/6/19.
 */
'use strict';
angular.module('EWeb').controller('IndexController',
  ['$rootScope', '$scope', 'GlobalEvent', 'Auth', 'EventError', '$state',
      function ($rootScope, $scope, GlobalEvent, Auth, EventError, $state) {
          $scope.showLoading = false;
          $rootScope.$on(GlobalEvent.onShowLoading, function (event, bo) {
              $scope.showLoading = bo;
          });
          $scope.pageConfig = {
              alertConfig: {
                  title: '消息',
                  content: '',
                  okLabel: '确定',
                  show: false,
                  callback: null
              },
              alertConfirmConfig: {
                  show: false,
                  title: '消息',
                  content: '',
                  cancel: '取消',
                  sure: '确认',
                  callback: null
              },
              current_status: '',
              errlist: [
                  'undefined_access_token',
                  'invalid_access_token',
                  'account_not_exist',
                  'network_error',
                  'invalid_account'
              ]
          };
          $rootScope.$on(GlobalEvent.onShowAlertConfirm, function (event, param, callback) {
              $scope.pageConfig.alertConfirmConfig.title = param.title ? param.title : '消息';
              $scope.pageConfig.alertConfirmConfig.sure = param.sureLabel ? param.sureLabel : '确认';
              $scope.pageConfig.alertConfirmConfig.cancel = param.cancelLabel ? param.cancelLabel : '取消';
              $scope.pageConfig.alertConfirmConfig.callback = callback;
              $scope.pageConfig.alertConfirmConfig.content = param.info;
              $scope.pageConfig.alertConfirmConfig.show = true;
          });

          $rootScope.$on(GlobalEvent.onShowAlert, function (event, info, callback) {
              $scope.pageConfig.alertConfig.content = EventError[info] ? EventError[info] : info;
              $scope.pageConfig.alertConfig.show = true;
              $scope.pageConfig.alertConfig.callback = callback;

              if ($scope.pageConfig.errlist.indexOf(info) > 0) {
                  $state.go('signIn');
              }
          });

          $scope.clickBody = function () {
              $rootScope.$broadcast(GlobalEvent.onBodyClick);
          };
      }]);

'use strict';
angular.module('EWeb').directive('zzValidation', function ($parse) {
  var _isMobile = /^\d{11}$/;
  var _integer = /\D/g;
  var _number = /[^\d{1}\.\d{1}|\d{1}]/g;
  var _result = '';
  return {
    require: '?ngModel',
    restrict: 'A',
    link: function (scope, element, attrs, modelCtrl) {
      if (!modelCtrl) {
        return;
      }
      _result = '';
      scope.$watch(attrs.ngModel, function () {
        if (modelCtrl.$viewValue === undefined || modelCtrl.$viewValue === null) {
          return;
        }
        var _regx = '';
        switch (attrs.zzValidationType) {
          case 'mobile':
            _regx = new RegExp(_isMobile);
            interceptionStr(_regx);
            break;
          case 'telephone':
            telephoneStr();
            break;
          case 'mail':
            mailStr();
            break;
          case 'integer':
            _regx = new RegExp(_integer);
            replaceStr(_regx);
            break;
          case 'number':
            _regx = _number;
            replaceStr(_regx);
            break;
          default:
            break;
        }
        modelCtrl.$setViewValue(_result);
        modelCtrl.$render();
      });
      element.bind('change', function () {
        if (modelCtrl.$viewValue === undefined || modelCtrl.$viewValue === null) {
          return;
        }
        var _regx = '';
        switch (attrs.zzValidationType) {
          case 'telephone':
            _regx = new RegExp(/\d{3}-\d{7,8}|\d{4}-\{7,8}/);
            if (!_regx.test(modelCtrl.$viewValue)) {
              modelCtrl.$setValidity('unique', false);
            }
            else {
              modelCtrl.$setValidity('unique', true);
            }
            break;
          case 'mail':
            _regx = new RegExp(/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/);
            if (!_regx.test(modelCtrl.$viewValue)) {
              modelCtrl.$setValidity('unique', false);
            }
            else {
              modelCtrl.$setValidity('unique', true);
            }
            break;
        }
      });

      var replaceStr = function (regx) {
        _result = modelCtrl.$viewValue.replace(regx, '');
        if (attrs.zzValidationType === 'number') {
          if (_result.indexOf('.') === 0) {
            _result = '';
          }
          else if(_result.indexOf('.')<_result.lastIndexOf('.')){
            _result = _result.substr(0, _result.length-1);
          }
        }
      };

      var interceptionStr = function (regx) {
        _result = modelCtrl.$viewValue.replace(_integer, '');
        if (!regx.test(modelCtrl.$viewValue)) {
          _result = _result.substr(0, 11);
        }
      };

      var telephoneStr = function () {
        _result = modelCtrl.$viewValue.replace(/[^-\d]/g, '');
        if (_result.indexOf('-') === 0) {
          _result = '';
        }
        else if(_result.indexOf('-')<_result.lastIndexOf('-')){
          _result = _result.substr(0, _result.length-1);
        }

      };

      var mailStr = function () {
        _result = modelCtrl.$viewValue.replace(/[^\w\d\.|\-|_|\@]/g, '');
      };
    }
  };
});

/**
 * Created by louisha on 16/01/26.
 *
 * option{
 *    text:'显示信息'
 *    separator:'是否是分隔标签'
 *    其他字段任意
 * }
 */

'use strict';

angular.module('EWeb').directive('zDropdown',
    ['$timeout', 'GlobalEvent',
        function ($timeout, GlobalEvent) {
            return {
                restrict: 'EA',
                templateUrl: 'directives/z_dropdown/z_dropdown.client.directive.html',
                replace: true,
                scope: {
                    zDropdownOptions: '=', //下拉框内容
                    zDropdownModel: '=', //model
                    zDropdownChange: '&',//model内容改变事件
                    zDropdownDisabled: '=',//不可用
                    zDropdownWaiting: '='//下拉框等待，用于自身加载数据或者由外部控制等待等
                },
                link: function (scope, element, attributes) {

                    scope.config = {
                        showOptions: false
                    };

                    function checkClickMe(meKey, target) {
                        if (target.$$hashKey && target.$$hashKey === meKey) {
                            return;
                        }
                        else if (target.parentElement) {
                            if (target.parentElement.nodeName === 'BODY') {
                                if (scope.config.showOptions) {
                                    scope.config.showOptions = false;
                                }
                                return;
                            }
                            checkClickMe(meKey, target.parentElement);
                        }
                        else {
                            if (scope.config.showOptions)
                                scope.config.showOptions = false;
                        }
                    }

                    scope.$on(GlobalEvent.onBodyClick, function (evt, data) {
                        if(!element[0] || !element[0].$$hashKey || !data || !data.target){
                            return;
                        }
                        checkClickMe(element[0].$$hashKey, data.target);
                    });

                    scope.elementClick = function (event) {
                        if (scope.zDropdownDisabled || scope.zDropdownWaiting) {
                            return;
                        }
                        scope.config.showOptions = !scope.config.showOptions;
                    };

                    scope.selectOption = function (option, event) {
                        if (event) {
                            event.stopPropagation();
                        }
                        scope.zDropdownModel = option;
                        $timeout(function () {
                            if (scope.zDropdownChange) {
                                scope.zDropdownChange();
                            }
                        });
                        scope.config.showOptions = false;
                    };

                    scope.generalSelectedText = function () {
                        if (!scope.zDropdownModel || !scope.zDropdownModel.text) {
                            return attributes.zDropdownLabel || '';
                        }
                        var modelType = typeof(scope.zDropdownModel);
                        var result = '';
                        switch (modelType) {
                            case 'string':
                                result = scope.zDropdownModel;
                                break;
                            case 'object':
                                result = scope.zDropdownModel.text;
                                break;
                            default:
                                result = '';
                                break;
                        }
                        return result;
                    };
                }
            };
        }]);

/**
 * Created by louisha on 15/10/13.
 */

'use strict';

angular.module('EWeb').directive('zHeader',
    ['Auth', 'GlobalEvent', '$state', 'UserService',
        function (Auth, GlobalEvent, $state, UserService) {
            return {
                restrict: 'EA',
                templateUrl: 'directives/z_header/z_header.client.directive.html',
                replace: true,
                scope: {
                    style: '@'
                },
                link: function (scope, element, attributes) {
                    scope.user = Auth.getUser();
                    scope.mainMenuOpened = false;
                    scope.menuOpened = false;
                    scope.toggleMenuOpen = function (event) {
                        scope.menuOpened = true;
                        console.log('mouse：' + scope.menuOpened);
                        if (event) {
                            event.stopPropagation();
                        }
                    };

                    scope.hideMenuOpen = function (event) {
                        scope.menuOpened = false;
                        console.log('mouse hide：' + scope.menuOpened);
                        if (event) {
                            event.stopPropagation();
                        }
                    };

                    scope.toggleMainMenuOpen = function (event) {
                        scope.mainMenuOpened = true;
                        console.log(scope.mainMenuOpened);
                        if (event) {
                            event.stopPropagation();
                        }
                    };

                    scope.hideMainMenuOpen = function (event) {
                        scope.mainMenuOpened = false;
                        console.log(scope.mainMenuOpened);
                        if (event) {
                            event.stopPropagation();
                        }
                    };

                    scope.goToView = function (type) {
                        scope.mainMenuOpened = false;
                        switch (type) {
                            case 'user_manager':
                                return $state.go('user_manager');
                            case 'restaurant':
                                return $state.go('goods_manager', {goods_type: 'dish'});
                            case 'supermarket':
                                return $state.go('goods_manager', {goods_type: 'goods'});
                            default :
                                return;
                        }
                    };

                    scope.translateRole = function(role){
                        return UserService.translateUserRole(role);
                    };

                    scope.quit = function () {
                        scope.menuOpened = false;
                        console.log('quit：' + scope.menuOpened);
                        scope.$emit(GlobalEvent.onShowAlertConfirm, {content: '您真的要退出吗？'}, function (status) {
                            if (status) {
                                UserService.signOut(function (err, data) {
                                    if (err) {
                                        return scope.$emit(GlobalEvent.onShowAlert, err);
                                    }
                                    $state.go('user_index');
                                });
                            }
                        });
                    };

                    scope.backHome = function () {
                        $state.go('user_index');
                    };
                }
            };
        }]);

/**
 * Created by elinaguo on 15/5/16.
 */
/**
 * function: 分页UI
 * author: elina
 *
 *  html代码
 *  <zz-pagination config="pagination"></zz-pagination>
 *
 *  angularjs代码
 $scope.pagination= {
                  currentPage: 1,                     //default
                  limit: 20,                          //default   每页显示几条
                  pageNavigationCount: 5,             //default   分页显示几页
                  totalCount: 0,
                  pageCount: 0,
                  limitArray: [10, 20, 30, 40, 100],  //default   每页显示条数数组
                  pageList: [1],                      //显示几页的数字数组
                  canSeekPage: true,                  //default   是否可以手动定位到第几页
                  canSetLimit: true,                  //default   是否可以设置每页显示几页
                  isShowTotalInfo: true,              //default   是否显示总记录数信息
                  onCurrentPageChanged: null or function(callback){
                                                  //do something
                                                  function(data){
                                                    //data.totalCount, data.limit
                                                    callback(data);
                                                  }
                                                }
              };
 $scope.pagination.render(); //渲染pagination
 *  }
 *
 */

'use strict';


angular.module('EWeb').directive('zPagination', [function () {
    return {
        restrict: 'EA',
        templateUrl: 'directives/z_pagination/z_pagination.client.directive.html',
        replace: true,
        scope: {
            config: '='
        },

        link: function (scope, element, attributes) {
            if (!scope.config) {
                scope.config = {};
            }

            function initConfig() {
                if (!scope.config.currentPage || scope.config.currentPage === 0) {
                    scope.config.currentPage = 1;
                }

                if (!scope.config.limit || scope.config.limit === 0) {
                    scope.config.limit = 20;
                }

                if (!scope.config.totalCount) {
                    scope.config.totalCount = 0;
                }

                if (!scope.config.pageCount) {
                    scope.config.pageCount = 0;
                }

                if (!scope.config.limitArray || scope.config.limitArray.length === 0) {
                    scope.config.limitArray = [10, 20, 30, 50, 100];
                }

                if (!scope.config.pageNavigationCount || scope.config.pageNavigationCount === 0) {
                    scope.config.pageNavigationCount = 5;
                }

                if (scope.config.isShowTotalInfo === undefined || scope.config.isShowTotalInfo === null) {
                    scope.config.isShowTotalInfo = true;
                }

                if (scope.config.canSetLimit === undefined || scope.config.canSetLimit === null) {
                    scope.config.canSetLimit = false;
                }

                if (scope.config.canSeekPage === undefined || scope.config.canSeekPage === null) {
                    scope.config.canSeekPage = false;
                }

                if (!scope.config.onChange) {
                    scope.onChange = function () {
                        console.log('Turn to the ' + scope.config.currentPage + ' page');
                    };
                }
            }

            scope.config.changePage = function (newPage) {
                switchPage(newPage);
            };

            scope.config.seekPage = function (newPage) {
                if (!newPage)
                    return;

                newPage = parseInt(newPage);
                if (newPage > scope.config.pageCount) {
                    return;
                }

                switchPage(newPage);
            };

            scope.config.changePageLimit = function () {
                scope.config.currentPage = 1;
                //limit已经通过ng－model改变
                scope.config.onCurrentPageChanged(function () {
                    scope.config.pageCount = Math.ceil(scope.config.totalCount / scope.config.limit);
                    refreshPageNavigation();
                });
            };

            scope.$watchCollection('config', function () {
                refreshPageNavigation();
            });

            function refreshPageNavigation() {
                if (scope.config.currentPage === '' || scope.config.currentPage <= 0) {
                    scope.config.currentPage = 1;
                    return;
                }
                scope.config.pageList = scope.config.pageList || [];
                scope.config.pageList.splice(0, scope.config.pageList.length);

                if (scope.config.pageCount > scope.config.pageNavigationCount) {
                    var length = ((scope.config.currentPage + scope.config.pageNavigationCount - 1) > scope.config.pageCount) ? scope.config.pageCount : (scope.config.currentPage + scope.config.pageNavigationCount - 1 );
                    var currentViewNumber = length - scope.config.pageNavigationCount + 1;
                    for (var i = currentViewNumber; i <= length; i++) {
                        scope.config.pageList.push(i);
                    }
                } else {
                    for (var j = 1; j <= scope.config.pageCount; j++) {
                        scope.config.pageList.push(j);
                    }
                }
            }

            function switchPage(newPage) {
                if (newPage === scope.config.currentPage) {
                    return;
                }
                scope.config.currentPage = newPage;

                if (!scope.config.onCurrentPageChanged) {
                    return;
                }

                scope.config.onCurrentPageChanged(function () {
                    scope.config.pageCount = Math.ceil(scope.config.totalCount / scope.config.limit);
                    refreshPageNavigation();
                });
            }

            initConfig();
        }
    };
}]);

'use strict';

angular.module('EWeb').directive('zzAlertConfirmDialog', function () {
    return {
        restrict: 'A',
        template: '<div class="mask" ng-show="pageConfig.show">' +
        '<div class="zz-alert">' +
        '<div class="zz-alert-title"> <span>{{pageConfig.title}}</span></div>' +
        '<div class="zz-alert-content"> <span>{{pageConfig.content}}</span></div>' +
        '<div class="row zz-alert-confirm-handle">' +
        '<div class="col-xs-6">' +
        '<div class="zz-btn-primary zz-alert-btn" ng-click="sure()">{{pageConfig.sure}}</div>' +
        '</div>' +
        '<div class="col-xs-6">' +
        '<div class="zz-btn-primary zz-alert-btn" ng-click="cancel()">{{pageConfig.cancel}}</div> ' +
        '</div> </div> </div></div>',
        replace: true,
        scope: {
            pageConfig: '='
        },
        link: function (scope, element, attributes) {
            if (!scope.pageConfig) {
                scope.pageConfig = {
                    show: false,
                    title: '消息',
                    content: '',
                    cancel: '取消',
                    sure: '确认',
                    callback: null
                };
            }
            scope.cancel = function () {
                scope.pageConfig.show = false;
                scope.pageConfig.content = '';
            };

            scope.sure = function () {
                scope.cancel();
                if (scope.pageConfig.callback) {
                    scope.pageConfig.callback();
                }
            };
            scope.$watch('show', function (newVal, oldVal) {
                scope.initShow();
            });
            scope.initShow = function () {
                console.log(scope.pageConfig.content);
            };

        }

    };
});

'use strict';
angular.module('EWeb').directive('zzAlertDialog', function () {
    return {
        restrict: 'EA',
        template: '<div class="mask" ng-show="pageConfig.show"><div class="zz-alert">' +
        '<div class="zz-alert-title"> <span>{{pageConfig.title}}</span></div>' +
        '<div class="zz-alert-content"> <span>{{pageConfig.content}}</span></div>' +
        '<div class="zz-alert-handle">' +
        '<div class="zz-btn-primary zz-alert-btn" ng-click="closed()">{{pageConfig.okLabel}}</div>' +
        ' </div></div></div>',
        replace: true,
        scope: {
            pageConfig: '='
        },
        link: function (scope, element, attributes) {
            if (!scope.pageConfig) {
                scope.pageConfig = {
                    title: '消息',
                    content: '内容',
                    okLabel: '确定',
                    show: true,
                    callback: null
                };
            }
            scope.closed = function () {
                scope.pageConfig.show = false;
                if (scope.pageConfig.callback) {
                    scope.pageConfig.callback();
                }
            };
            scope.$watch('show', function (newVal, oldVal) {
                scope.initShow();
            });
            scope.initShow = function () {
                console.log(scope.pageConfig.content);
            };
        }
    };
});
