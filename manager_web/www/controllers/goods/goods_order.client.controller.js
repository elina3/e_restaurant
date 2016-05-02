/**
 * Created by elinaguo on 16/5/2.
 */
'use strict';
angular.module('EWeb').controller('GoodsOrderController',
  ['$scope', '$stateParams', '$window', '$rootScope', 'GlobalEvent', '$state', 'GoodsService', 'QiNiuService', 'Config','OrderService',
    function ($scope, $stateParams, $window, $rootScope,  GlobalEvent, $state, GoodsService, QiNiuService, Config, OrderService) {

      $scope.goBack = function () {
        $window.history.back();
      };

      function generateUrl(src) {
        return Config.qiniuServerAddress + 'Fhnym0URhv5-AR8JgenBlTfITaVI';
      }

      $scope.generateStyle = function (src) {
        return {
          'background': 'url(' + generateUrl(src) + ') no-repeat center top',
          'background-size': 'cover'
        };
      };

      $scope.goToOrderManager = function(){
        $state.go('goods_order');
      };
    }]);