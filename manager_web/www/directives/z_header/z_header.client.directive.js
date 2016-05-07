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

                    if(!scope.user){
                        $state.go('user_sign_in');
                        return;
                    }

                    scope.quit = function () {
                        scope.menuOpened = false;
                        Auth.setUser(null);
                        Auth.setToken('');
                        $state.go('user_sign_in');
                        //console.log('quit：' + scope.menuOpened);
                        //scope.$emit(GlobalEvent.onShowAlertConfirm, {content: '您真的要退出吗？'}, function (status) {
                        //    if (status) {
                        //        UserService.signOut(function (err, data) {
                        //            if (err) {
                        //                return scope.$emit(GlobalEvent.onShowAlert, err);
                        //            }
                        //            $state.go('user_index');
                        //        });
                        //    }
                        //});
                    };

                    scope.backHome = function () {
                        if(!scope.user){
                            return $state.go('sign_in');
                        }

                        if(scope.user && scope.user.role === 'admin'){
                            $state.go('user_index');
                        }
                    };
                }
            };
        }]);
