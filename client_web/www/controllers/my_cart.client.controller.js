/**
 * Created by elinaguo on 16/4/9.
 */
'use strict';
angular.module('EClientWeb').controller('MyCartController',
  [
    '$rootScope',
    '$scope',
    '$state',
    '$window',
    '$location',
    function ($rootScope,
              $scope,
              $state,
              $window,
              $location) {

      $scope.pageData = {
        title: '我的购物车',
        headConfig: {
          title: '购物车',
          backView: '',
          backShow: true
        },
        goods: {
          count: 1
        }
      };

      function init(){
        console.log($location);

      }

      init();

      $scope.goToView = function(viewPage){
        switch(viewPage){
          case 'orderDetail':
            $state.go('order_detail');
            break;
          case 'signIn':
            $state.go('sign_in');
            break;
        }
      };

    }]);
