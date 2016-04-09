/**
 * Created by louisha on 15/9/24.
 */

'use strict';

angular.module('EClientWeb').factory('PublicInterceptor', [function () {
  return {
    'request': function (req) {
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
