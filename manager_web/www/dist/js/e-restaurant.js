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
      //.state('user_sign_up', {
      //    url: '/user/sign_up',
      //    templateUrl: 'templates/user/sign_up.client.view.html',
      //    controller: 'UserSignUpController'
      //})
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
      .state('goods_add', {
        url: '/goods/add',
        templateUrl: 'templates/goods/goods_add.client.view.html',
        controller: 'GoodsAddController'
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
      });

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
    qiniuServerAddress: 'http://7xs3gd.com1.z0.glb.clouddn.com/'
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


'use strict';
/**
 * Created by louisha on 15/11/2
 */
angular.module('EWeb').service('QiNiuService',
  ['$http', '$q', 'localStorageService', 'RequestSupport', 'Config', 'SystemError',
      function ($http, $q, localStorageService, RequestSupport, Config, SystemError) {
          function utf16to8(str) {
              var out, i, len, c;
              out = '';
              len = str.length;
              for (i = 0; i < len; i++) {
                  c = str.charCodeAt(i);
                  if ((c >= 0x0001) && (c <= 0x007F)) {
                      out += str.charAt(i);
                  } else if (c > 0x07FF) {
                      out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                      out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
                      out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
                  } else {
                      out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
                      out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
                  }
              }
              return out;
          }

          /*
           * Interfaces:
           * b64 = base64encode(data);
           */
          var base64EncodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

          function base64encode(str) {
              var out, i, len;
              var c1, c2, c3;
              len = str.length;
              i = 0;
              out = '';
              while (i < len) {
                  c1 = str.charCodeAt(i++) & 0xff;
                  if (i === len) {
                      out += base64EncodeChars.charAt(c1 >> 2);
                      out += base64EncodeChars.charAt((c1 & 0x3) << 4);
                      out += '==';
                      break;
                  }
                  c2 = str.charCodeAt(i++);
                  if (i === len) {
                      out += base64EncodeChars.charAt(c1 >> 2);
                      out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                      out += base64EncodeChars.charAt((c2 & 0xF) << 2);
                      out += '=';
                      break;
                  }
                  c3 = str.charCodeAt(i++);
                  out += base64EncodeChars.charAt(c1 >> 2);
                  out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                  out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
                  out += base64EncodeChars.charAt(c3 & 0x3F);
              }
              return out;
          }


          var uploadEndPoint = 'http://up.qiniu.com';

          // if page loaded over HTTPS, then uploadEndPoint should be "https://up.qbox.me", see https://github.com/qiniu/js-sdk/blob/master/README.md#%E8%AF%B4%E6%98%8E
          if (window && window.location && window.location.protocol === 'https:') {
              uploadEndPoint = 'https://up.qbox.me';
          }

          var defaultsSetting = {
              chunkSize: 1024 * 1024 * 4,
              mkblkEndPoint: uploadEndPoint + '/mkblk/',
              mkfileEndPoint: uploadEndPoint + '/mkfile/',
              maxRetryTimes: 3
          };

          //Is support qiniu resumble upload
          this.support = (
          typeof File !== 'undefined' &&
          typeof Blob !== 'undefined' &&
          typeof FileList !== 'undefined' &&
          (!!Blob.prototype.slice || !!Blob.prototype.webkitSlice || !!Blob.prototype.mozSlice ||
          false
          )
          );
          if (!this.support) {
              return null;
          }

          var fileHashKeyFunc = function (file) {
              return file.name + file.lastModified + file.size + file.type;
          };

          return {
              upload: function (config) {
                  var deferred = $q.defer();
                  var promise = deferred.promise;

                  var file = config.file;
                  if (!file) {
                      return;
                  }

                  var fileHashKey = fileHashKeyFunc(file);
                  var blockRet = localStorageService.get(fileHashKey);
                  if (!blockRet) {
                      blockRet = [];
                  }
                  var blkCount = (file.size + ((1 << 22) - 1)) >> 22;

                  var getChunck = function (file, startByte, endByte) {
                      return file[(file.slice ? 'slice' : (file.mozSlice ? 'mozSlice' : (file.webkitSlice ? 'webkitSlice' : 'slice')))](startByte, endByte);
                  };

                  var getBlkSize = function (file, blkCount, blkIndex) {

                      if (blkIndex === blkCount - 1) {
                          return file.size - 4194304 * blkIndex;
                      } else {
                          return 4194304;
                      }
                  };

                  var mkfile = function (file, blockRet) {
                      if (blockRet.length === 0) {
                          return;
                      }
                      var body = '';
                      var b;
                      for (var i = 0; i < blockRet.length - 1; i++) {
                          b = angular.fromJson(blockRet[i]);
                          body += (b.ctx + ',');
                      }
                      b = angular.fromJson(blockRet[blockRet.length - 1]);
                      body += b.ctx;

                      var url = defaultsSetting.mkfileEndPoint + file.size;
                      if (config && config.key) {
                          url += ('/key/' + base64encode(utf16to8(config.key)));
                      }
                      $http({
                          url: url,
                          method: 'POST',
                          data: body,
                          headers: {
                              'Authorization': 'UpToken ' + config.token,
                              'Content-Type': 'text/plain'
                          }
                      }).success(function (e) {
                          deferred.resolve(e);
                          localStorageService.remove(fileHashKey);
                      }).error(function (e) {
                          deferred.reject(e);
                      });
                  };
                  var xhr;

                  var mkblk = function (file, i, retry) {
                      if (i === blkCount) {
                          mkfile(file, blockRet);
                          return;
                      }
                      if (!retry) {
                          deferred.reject('max retried,still failure');
                          return;
                      }
                      var blkSize = getBlkSize(file, blkCount, i);
                      var offset = i * 4194304;
                      var chunck = getChunck(file, offset, offset + blkSize);

                      xhr = new XMLHttpRequest();
                      xhr.open('POST', defaultsSetting.mkblkEndPoint + blkSize, true);
                      xhr.setRequestHeader('Authorization', 'UpToken ' + config.token);

                      xhr.upload.addEventListener('progress', function (evt) {
                          if (evt.lengthComputable) {
                              var nevt = {
                                  totalSize: file.size,
                                  loaded: evt.loaded + offset
                              };
                              deferred.notify(nevt);
                          }
                      });

                      xhr.upload.onerror = function () {
                          mkblk(config.file, i, --retry);
                      };

                      xhr.onreadystatechange = function (response) {
                          if (response && xhr.readyState === 4 && xhr.status === 200) {
                              if (xhr.status === 200) {
                                  blockRet[i] = xhr.responseText;
                                  localStorageService.set(fileHashKey, blockRet);
                                  mkblk(config.file, ++i, defaultsSetting.maxRetryTimes);
                              } else {
                                  mkblk(config.file, i, --retry);
                              }
                          }
                      };
                      xhr.send(chunck);
                  };


                  mkblk(config.file, blockRet.length, defaultsSetting.maxRetryTimes);
                  promise.abort = function () {
                      xhr.abort();
                      localStorageService.remove(fileHashKey);
                  };

                  promise.pause = function () {
                      xhr.abort();
                  };

                  return promise;
              },
              qiNiuKey: function (callback) {
                  RequestSupport.executeGet('/token/image/upload', {})
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
              qiNiuUptokenUrl: function () {
                  return Config.serverAddress + '/token/image/upload';
              }
          };
      }]);

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


/**
 * Created by elinaguo on 16/4/16.
 */

'use strict';
angular.module('EWeb').controller('GoodsAddController',
  ['$scope', '$stateParams', '$window', '$rootScope',  'GlobalEvent', '$state', 'GoodsService', 'QiNiuService', 'Config',
    function ($scope, $stateParams, $window, $rootScope, GlobalEvent, $state, GoodsService, QiNiuService, Config) {

      var qiniuToken;
      $scope.pageData = {
        photos: []
      };

      function init(){

        $scope.$emit(GlobalEvent.onShowLoading, true);
        QiNiuService.qiNiuKey(function(err, data){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if(err){
            console.log(err);
            return;
          }

          console.log(data);
          qiniuToken = data.token;
        });
      }

      init();

      function generalImgUrl(imgName) {
        return Config.qiniuServerAddress + imgName;
      }

      function start(index, target) {
        target[index].progress = {
          p: 0
        };
        target[index].upload = QiNiuService.upload({
          file: target[index].file,
          token: qiniuToken
        });
        target[index].upload.then(function (response) {
          $scope.pageData.photos.push(response.key);
          target[index].img = generalImgUrl(response.key);
        }, function (response) {
          alert(response);
          console.log(response);
        }, function (evt) {
          target[index].progress.p = Math.floor(100 * evt.loaded / evt.totalSize);
        });
      }

      $scope.onFileSelect = function ($files, target) {
        var offsetx = target.length;
        for (var i = 0; i < $files.length; i++) {
          target[i + offsetx] = {
            file: $files[i]
          };
          start(i + offsetx, target);
        }
      };



      $scope.abort = function (index, target) {
        if (target[index].upload) {
          //待修改的，非上传图片属性不会有这个属性
          target[index].upload.abort();
        }
        target.splice(index, 1);
        $scope.pageData.photos.splice(index, 1);
      };

    }]);

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

      $scope.addGoods = function(){
        $state.go('goods_add');
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



      //
      //var fileUploadObj;
      //function uploadStart(file) {
      //  if (!fileUploadObj) {
      //    fileUploadObj = {
      //      file: null,
      //      upload: null,
      //      progress: {p: 0},
      //      img: ''
      //    };
      //  }
      //  fileUploadObj.file = file;
      //  fileUploadObj.upload = null;
      //  uploadHandle();
      //}
      //
      //function uploadHandle() {
      //  var compressOption = {
      //    cpmpressMaxSize: 30,
      //    quality: 70
      //  };
      //  fileUploadObj.upload = QiNiuService.upload({
      //    file: fileUploadObj.file
      //  }, compressOption);
      //  fileUploadObj.upload.then(function (response) {
      //    //response.key
      //    fileUploadObj.img = Config.qiniuServerAddress + '/' + response.key;
      //  }, function (err) {
      //    $scope.$emit(GlobalEvent.onShowAlert, {content: err});
      //  });
      //}
    }]);

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
/**
 * Created by elina on 15/6/24.
 */
angular.module('EWeb').directive('eFileSelect', ['$parse', '$timeout',
    function ($parse, $timeout) {
        return function (scope, elem, attr) {
            var fn = $parse(attr.eFileSelect);
            if (elem[0].tagName.toLowerCase() !== 'input' || (elem.attr('type') && elem.attr('type').toLowerCase()) !== 'file') {
                var fileElem = angular.element('<input type="file">');
                for (var i = 0; i < elem[0].attributes.length; i++) {
                    fileElem.attr(elem[0].attributes[i].name, elem[0].attributes[i].value);
                }
                if (elem.attr('data-multiple')) fileElem.attr('multiple', 'true');
                //fileElem.css('top', 0).css('bottom', 0).css('left', 0).css('right', 0).css('width', '100%').
                //    css('opacity', 0).css('position', 'absolute').css('filter', 'alpha(opacity=0)');
                elem.append(fileElem);
                //if (elem.css('position') === '' || elem.css('position') === 'static') {
                //    elem.css('position', 'relative');
                //}
                elem = fileElem;
            }
            elem.bind('change', function (evt) {
                var files = [],
                    fileList, i;
                fileList = evt.__files_ || evt.target.files;
                if (fileList !== null) {
                    for (i = 0; i < fileList.length; i++) {
                        files.push(fileList.item(i));
                    }
                }
                $timeout(function () {
                    fn(scope, {
                        $files: files,
                        $event: evt
                    });
                });
            });
        };
    }
]);

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
