/**
 * Created by elinaguo on 16/4/22.
 */
'use strict';
angular.module('EClientWeb').controller('PaymentController',
  [
    '$rootScope',
    '$scope',
    '$state',
    '$window',
    '$stateParams',
    'Auth',
    'GlobalEvent',
    'ResourcesService',
    'OrderService',
    'GoodsService',
    function ($rootScope,
              $scope,
              $state,
              $window,
              $stateParams,
              Auth,
              GlobalEvent,
              ResourcesService,
              OrderService,
              GoodsService) {

      function getClient() {
        var client = Auth.getUser();
        if (!client) {
          $scope.$emit(GlobalEvent.onShowAlert, '亲，请登录！');
          $state.go('sign_in');
          return null;
        }
        return client;
      }

      $scope.pageData = {
        headConfig: {
          title: '订单支付',
          backView: '',
          backShow: false
        },
        order: null,
        paymentInfo:{
          method: 'card',
          card_number: ''
        }
      };

      $scope.goBack = function () {
        $window.history.back();
      };

      function loadOrderDetail(orderId) {
        OrderService.getOrderDetail(orderId, function (err, data) {
          if (err || !data.order) {
            $scope.$emit(GlobalEvent.onShowAlert, '获取订单信息失败！' + err);
          }

          $scope.pageData.order = data.order;
        });
      }

      function init() {
        var orderId = $stateParams.order_id;

        if (!orderId) {
          $scope.$emit(GlobalEvent.onShowAlert, '订单参数错误');
        }
        loadOrderDetail(orderId);
      }

      init();

      $scope.pay = function(){
        if(!$scope.pageData.paymentInfo.card_number){
          return $scope.$emit(GlobalEvent.onShowAlert, '请输入卡号！');
        }

        OrderService.pay($scope.pageData.orderDetail.order_number,
          $scope.pageData.paymentInfo.card_number,
          $scope.pageData.orderDetail.total_price ,function(err, data){
          if(err){
            return $scope.$emit(GlobalEvent.onShowAlert, '支付失败，请重新支付！' + err);
          }

          return $state.go('my_order');
        });
      };
    }]);
