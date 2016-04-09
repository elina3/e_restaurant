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
