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
          title: '瑞金古北分院食堂',
          backView: '／',
          backShow: false
        },
        goods: {
          price: 12,
          count: 1
        }
      };

      $scope.goBack = function(){
        $window.history.back();
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
