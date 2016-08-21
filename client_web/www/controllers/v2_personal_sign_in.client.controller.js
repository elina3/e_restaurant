/**
 * Created by elinaguo on 16/7/28.
 */
'use strict';
angular.module('EClientWeb').controller('PersonalSignInController',
  [
    '$rootScope',
    '$scope',
    '$state',
    '$window',
    'Config',
    'ClientService',
    'GlobalEvent',
    'Auth',
    function ($rootScope,
              $scope,
              $state,
              $window,
              Config,
              ClientService,
              GlobalEvent,
              Auth) {

      $scope.pageData = {
        title: '个人登录',
        password: '',
        username: ''
      };

      function validPhone(phone) {
        var phoneReg = /\d{11}/;
        if (!phoneReg.test(phone) || phone.length !== 11) {
          return false;
        }

        return true;
      }

      $scope.goBack = function(){
        $window.history.back();
      };

      $scope.goToHome = function(){
        $state.go('/');
      };

      $scope.goToWorkers = function(){
        $state.go('sign_in');
      };

      $scope.goToManager = function(){
        $window.location.href = Config.managerServerAddress;
      };

      $scope.signIn = function(){
        if ($scope.pageData.username === '') {
          return $scope.$emit(GlobalEvent.onShowAlert, '请输入手机号');
        }

        if (!validPhone($scope.pageData.username )){
          return $scope.$emit(GlobalEvent.onShowAlert, '请输入有效的手机号');
        }

        $scope.$emit(GlobalEvent.onShowLoading, true);
        ClientService.personalSignIn($scope.pageData.username, function(err, data){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err) {
            $scope.$emit(GlobalEvent.onShowAlert, err);
            return;
          }

          Auth.setUser(data.client);
          Auth.setToken(data.access_token);

          $state.go('/');
        });

      };
    }]);
