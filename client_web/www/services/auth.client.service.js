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
