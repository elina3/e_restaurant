/**
 * Created by elinaguo on 16/4/8.
 */
'use strict';
angular.module('EClientWeb').controller('HomeController',
  [
    '$rootScope',
    '$scope',
    '$state',
    function ($rootScope,
              $scope,
              $state) {

      $scope.pageData = {
        title: '首页'
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
        }
      };

    }]);
