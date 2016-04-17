/**
 * Created by elinaguo on 15/9/24.
 */
'use strict';
angular.module('EClientWeb').controller('IndexController',
    [
        '$rootScope',
        '$scope',
      '$state',
      '$location',
      'GlobalEvent',
        'EventError',
        function ($rootScope,
                  $scope,
                  $state,
                  $location,
                  GlobalEvent,
                  EventError) {

            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                $rootScope.location = toState.name;
            });

            $scope.goToView = function(viewPage){
                switch(viewPage){
                    case 'goodsDetail':
                        $state.go('goods_detail');
                        break;
                    case 'freeMeal':
                        $state.go('free_meal');
                        break;
                    case 'goodsCart':
                        $state.go('my_cart');
                        break;
                    case 'myOrders':
                        $state.go('my_orders');
                        break;
                    case 'signIn':
                        $state.go('sign_in');
                        break;
                    case 'home':
                        $state.go('/');
                        break;
                }
            };

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
