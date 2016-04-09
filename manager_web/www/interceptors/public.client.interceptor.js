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

