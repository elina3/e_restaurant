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

        UserService.signIn($scope.signInObject, function(err, data){
          if (err) {
            $scope.$emit(GlobalEvent.onShowAlert, err);
            return;
          }

          $state.go('user_sign_up');
        });
      };
    }]);
