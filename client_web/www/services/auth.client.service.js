'use strict';

angular.module('EClientWeb').factory('Auth',
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
                        currentUser = localStorageService.get('client');
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
                        localStorageService.set('client', '');
                        currentUser = null;
                        return;
                    }
                    currentUser = user;
                    localStorageService.set('client', user);
                },
                getToken: function () {
                    if (!currentToken) {
                        currentToken = localStorageService.get('client_token');
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
                        localStorageService.set('client_token', '');
                        return;
                    }
                    currentToken = token;
                    localStorageService.set('client_token', token);
                },
                signOut: function () {
                    currentUser = null;
                    currentToken = null;
                    localStorageService.set('client_token', currentToken);
                }
            };

        }]);
