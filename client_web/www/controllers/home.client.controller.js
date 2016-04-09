/**
 * Created by elinaguo on 16/4/8.
 */
'use strict';
angular.module('EClientWeb').controller('HomeController',
  [
    '$rootScope',
    '$scope',
    '$state',
    '$window',
    'ResourcesService',
    function ($rootScope,
              $scope,
              $state,
              $window,
              ResourcesService) {

      $scope.pageData = {
        title: '首页',
        headConfig: {
          title: '瑞金古北分院食堂',
          backView: '／',
          backShow: false
        }
      };

      $scope.generatePhotoSrc = function (photo) {
        return ResourcesService.getImageUrl(photo);
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
