/**
 * Created by elinaguo on 16/4/9.
 */
'use strict';
angular.module('EClientWeb').controller('MyOrdersController',
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
        title: '我的订单',
        headConfig: {
          title: '我的订单',
          backView: '',
          backShow: true
        }
      };


      $scope.goBack = function(){
        $window.history.back();
      };

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
