/**
 * Created by elinaguo on 16/4/9.
 */
'use strict';
angular.module('EClientWeb').controller('SignInController',
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
        title: '登录',
        password: '',
        username: ''
      };


      $scope.goBack = function(){
        $window.history.back();
      };

      $scope.goToManager = function(){
        $window.location.href = Config.managerServerAddress;
      };

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
        }
      };

      $scope.signIn = function(){
        if ($scope.pageData.username === '') {
          $scope.$emit(GlobalEvent.onShowAlert, '请输入用户名');
          return;
        }
        if ($scope.pageData.password === '') {
          $scope.$emit(GlobalEvent.onShowAlert, '请输入密码');
          return;
        }

        $scope.$emit(GlobalEvent.onShowLoading, true);
        ClientService.signIn($scope.pageData, function(err, data){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err) {
            $scope.$emit(GlobalEvent.onShowAlert, err);
            return;
          }

          Auth.setUser(data.client);
          Auth.setToken(data.access_token);
          console.log('client');
          console.log(data.client);

          $state.go('/');
        });

      };
    }]);
