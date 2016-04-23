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
    'OrderService',
    'GlobalEvent',
    'ResourcesService',
    function ($rootScope,
              $scope,
              $state,
              $window,
              OrderService,
              GlobalEvent,
              ResourcesService) {

      $scope.pageData = {
        title: '我的订单',
        headConfig: {
          title: '我的订单',
          backView: '',
          backShow: true
        },
        orders: [],
        pagination: {
          skipCount: 0,
          totalCount: 0,
          limit: 20
        }
      };

      function loadOrders(){

        $scope.$emit(GlobalEvent.onShowLoading, true);
        OrderService.getMyOrders($scope.pageData.pagination, function(err, data){

          $scope.$emit(GlobalEvent.onShowLoading, false);
          if(err || !data.orders){
            return $scope.$emit(GlobalEvent.onShowAlert, '获取数据失败，请刷新页面重试');
          }

          $scope.pageData.orders = $scope.pageData.orders.concat(data.orders);
          $scope.pageData.pagination.skipCount += data.orders.length;
          $scope.pageData.pagination.totalCount = data.total_count;
        });
      }

      $scope.goBack = function(){
        $window.history.back();
      };
      $scope.generatePhotoSrc = function (goods) {
        if(goods && goods.display_photos && goods.display_photos.length  > 0){
          return ResourcesService.getImageUrl(goods.display_photos[0]);
        }
        return '';
      };
      $scope.goToOrderDetail = function(order){
        $state.go('order_detail', {order_id: order._id});
      };
      $scope.loadMore = function(){
        loadOrders();
      };

      $scope.translateOrderStatus = function(status){
        return OrderService.translateOrderStatus(status);
      };

      $scope.translateGoodsStatus = function(status){
        return OrderService.translateGoodsStatus(status);
      };

      function init(){
        loadOrders();
      }
      init();
    }]);
