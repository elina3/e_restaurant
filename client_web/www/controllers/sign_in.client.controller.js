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
    function ($rootScope,
              $scope,
              $state,
              $window,
              Config) {

      $scope.pageData = {
        title: '登录',
        password: '123456',
        username: '18321740710'
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

      };
    }]);
