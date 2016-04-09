/**
 * Created by elinaguo on 16/4/9.
 */
'use strict';
angular.module('EClientWeb').controller('GoodsDetailController',
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
        title: '商品详情',
        headConfig: {
          title: '商品详情',
          backView: '',
          backShow: true
        },
        goods: {
          price: 12,
          count: 1
        }
      };

      $scope.goToView = function(viewPage){
        switch(viewPage){
          case 'goodsCart':
            $state.go('my_cart');
            break;
          case 'orderDetail':
            $state.go('order_detail');
            break;
          case 'signIn':
            $state.go('sign_in');
            break;
        }
      };

    }]);
