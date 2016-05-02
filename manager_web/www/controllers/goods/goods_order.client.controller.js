/**
 * Created by elinaguo on 16/5/2.
 */
'use strict';
angular.module('EWeb').controller('GoodsOrderController',
  ['$scope', '$window', '$rootScope', 'GlobalEvent', '$state', 'QiNiuService', 'Config','OrderService',
    function ($scope, $window, $rootScope,  GlobalEvent, $state, QiNiuService, Config, OrderService) {

      $scope.orders = [];
      $scope.currentStatus = {id:''};
      $scope.statuses = [
        {id: '', text: '所有状态'},
        {id: 'unpaid', text: '未支付'},
        {id: 'paid', text: '已支付'},
        {id: 'cooking', text: '烹饪中'},
        {id: 'transporting', text: '配送中'},
        {id: 'complete', text: '已完成'}];
      $scope.pagination = {
        currentPage: 1,
        limit: 10,
        totalCount: 0,
        skipCount: 0,
        onCurrentPageChanged: function (callback) {
          loadOrders();
        }
      };

      $scope.goBack = function () {
        $window.history.back();
      };

      function generateUrl(src) {
        return Config.qiniuServerAddress + src;
      }

      $scope.generateStyle = function (src) {
        if(!src){
          return;
        }
        return {
          'background': 'url(' + generateUrl(src) + ') no-repeat center top',
          'background-size': 'cover'
        };
      };

      $scope.translateOrderStatus = function(status){
        return OrderService.translateOrderStatus(status);
      };

      $scope.translateGoodsOrderStatus = function(status){
        return OrderService.translateGoodsOrderStatus(status);
      };

      $scope.cook = function(order){
        $scope.$emit(GlobalEvent.onShowLoading, true);
        OrderService.cookOrder(order._id, function(err, result){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if(err || !result.success){
            $scope.$emit(GlobalEvent.onShowAlert, err);
          }
          $state.reload();
        });
      };

      $scope.delivery = function(order){
        $scope.$emit(GlobalEvent.onShowLoading, true);
        OrderService.deliveryOrder(order._id, function(err, result){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if(err || !result.success){
            $scope.$emit(GlobalEvent.onShowAlert, err);
          }
          $state.reload();
        });
      };

      $scope.complete = function(order){
        $scope.$emit(GlobalEvent.onShowLoading, true);
        OrderService.completeOrder(order._id, function(err, result){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if(err || !result.success){
            $scope.$emit(GlobalEvent.onShowAlert, err);
          }
          $state.reload();
        });
      };

      $scope.loadMore = function(){
        loadOrders();
      };

      $scope.search = function(){
        $scope.pagination.currentPage = 1;
        $scope.pagination.skipCount = 0;
        $scope.pagination.totalCount = 0;
        loadOrders();
      };

      function loadOrders(){
        OrderService.getOrders($scope.pagination, $scope.currentStatus.id, function(err, data){
          console.log(data);
          $scope.orders = data.orders;
          $scope.pagination.skipCount += data.orders.length;

          $scope.pagination.totalCount = data.total_count;
          $scope.pagination.limit = data.limit;
          $scope.pagination.pageCount = Math.ceil($scope.pagination.totalCount / $scope.pagination.limit);
        });
      }

      function init(){
        loadOrders();
      }
      init();
    }]);