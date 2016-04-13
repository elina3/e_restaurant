/**
 * Created by elinaguo on 16/4/9.
 */
'use strict';
angular.module('EClientWeb').controller('FreeMealController',
  [
    '$rootScope',
    '$scope',
    '$state',
    '$window',
    function ($rootScope,
              $scope,
              $state,
              $window) {

      $scope.pageData = {
        title: '自由餐页面'
      };


      $scope.goBack = function(){
        $window.history.back();
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
