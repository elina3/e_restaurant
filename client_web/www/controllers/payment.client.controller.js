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

      $scope.client = null;

      $scope.pageData = {
        headConfig: {
          title: '订单支付',
          backView: '',
          backShow: false
        },
        order: null,
        paymentInfo:{
          method: 'card',
          card_number: '',
          card_password: ''
        }
      };

      $scope.goBack = function () {
        $window.history.back();
      };

      function loadOrderDetail(orderId) {
        $scope.$emit(GlobalEvent.onShowLoading, true);

        OrderService.getOrderDetail(orderId, function (err, data) {

          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err || !data.order) {
            $scope.$emit(GlobalEvent.onShowAlert, '获取订单信息失败！' + err);
          }

          $scope.pageData.order = data.order;
        });
      }

      function init() {
        $scope.client = getClient();
        if(!$scope.client){
          return;
        }

        var orderId = $stateParams.order_id;

        if (!orderId) {
          $scope.$emit(GlobalEvent.onShowAlert, '订单参数错误');
        }
        loadOrderDetail(orderId);
      }

      init();

      $scope.pay = function(){
        $scope.client = getClient();
        if(!$scope.client){
          return;
        }

        if($scope.client.role === 'normal'){
          if(!$scope.pageData.paymentInfo.card_number){
            return $scope.$emit(GlobalEvent.onShowAlert, '请输入身份证号！');
          }

          if(!$scope.pageData.paymentInfo.card_password){
            return $scope.$emit(GlobalEvent.onShowAlert, '请输入密码！');
          }

          OrderService.payWithPassword({
              order_id: $scope.pageData.order._id,
              id_number: $scope.pageData.paymentInfo.card_number,
              password: $scope.pageData.paymentInfo.card_password
            },function(err, data){

              $scope.$emit(GlobalEvent.onShowLoading, false);
              if(err){
                return $scope.$emit(GlobalEvent.onShowAlert, err);
              }

              return $state.go('my_orders');
            });
        }else{

          if(!$scope.pageData.paymentInfo.card_number){
            return $scope.$emit(GlobalEvent.onShowAlert, '请输入卡号！');
          }

          $scope.$emit(GlobalEvent.onShowLoading, true);
          OrderService.pay($scope.pageData.order._id,
            $scope.pageData.paymentInfo.card_number,
            $scope.pageData.order.total_price ,function(err, data){

              $scope.$emit(GlobalEvent.onShowLoading, false);
              if(err){
                return $scope.$emit(GlobalEvent.onShowAlert, err);
              }

              return $state.go('my_orders');
            });
        }
      };
    }]);
