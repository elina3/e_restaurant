/**
 * Created by elinaguo on 16/4/9.
 */
'use strict';
angular.module('EClientWeb').controller('OrderDetailController',
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
        title: '订单详情',
        headConfig: {
          title: '订单详情',
          backView: '',
          backShow: true
        },
        scan: false,
        orderDetail: {
          order_number: '',
          status: 'prepare',
          goods_infos: [],
          contact: {
            name: '郭姗姗',
            address: '201栋 病床4号',
            mobile_phone: '18321740710'
          },
          in_store_deal: true,
          total_price: 40,
          description: '甜不辣'
        },
        paymentInfo: {
          show: false,
          method: 'card',
          card_number: ''
        }
      };

      $scope.generatePhotoSrc = function (photoKey) {
        if (photoKey) {
          return ResourcesService.getImageUrl(photoKey);
        }
        return '';
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

          $scope.pageData.orderDetail._id = data.order._id;
          $scope.pageData.orderDetail.status = data.order.status;
          $scope.pageData.orderDetail.in_store_deal = data.order.in_store_deal;
          $scope.pageData.orderDetail.total_price = data.order.total_price;
          $scope.pageData.orderDetail.description = data.order.description;
          if (!data.order.in_store_deal && data.order.contact) {
            $scope.pageData.orderDetail.contact = data.order.contact;
          }
          $scope.pageData.orderDetail.goods_infos = [];
          data.order.goods_orders.forEach(function (goodsOrder) {
            $scope.pageData.orderDetail.goods_infos.push({
              _id: goodsOrder.goods_id,
              name: goodsOrder.name,
              description: goodsOrder.description,
              price: goodsOrder.price,
              count: goodsOrder.count,
              status: goodsOrder.status,
              display_photos: goodsOrder.display_photos
            });
          });
        });
      }

      function initOrderDetail(goodsInfos) {
        var goodsIdList = [];
        var goodsDic = {};
        goodsInfos.forEach(function (goodsInfo) {
          goodsIdList.push(goodsInfo._id);
          goodsDic[goodsInfo._id] = goodsInfo.count;
        });

        $scope.$emit(GlobalEvent.onShowLoading, true);
        GoodsService.getGoodsList({goods_ids: goodsIdList}, function (err, data) {

          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err || !data) {
            $scope.$emit(GlobalEvent.onShowAlert, '获取商品信息失败！' + err);
          }
          var totalPrice = 0;
          data.goods_list.forEach(function (goods) {
            var count = goodsDic[goods._id];
            $scope.pageData.orderDetail.goods_infos.push({
              _id: goods._id,
              name: goods.name,
              description: goods.description,
              price: goods.price,
              count: count,
              display_photos: goods.display_photos
            });
            totalPrice += (goods.price * count);
          });
          $scope.pageData.orderDetail.total_price = totalPrice;
        });
      }

      function init() {
        var goodsInfoString = $stateParams.goods_infos;
        var orderId = $stateParams.order_id;
        var goodsInfos;
        try {
          goodsInfos = JSON.parse(goodsInfoString);
        }
        catch (e) {
          goodsInfos = [];
        }

        if (orderId) {
          $scope.pageData.scan = true;
        }

        if (!orderId && (!goodsInfos || goodsInfos.length === 0)) {
          $scope.$emit(GlobalEvent.onShowAlert, '没有任何物品需要买单');
          $window.history.back();
          return;
        }

        if (orderId) {
          loadOrderDetail(orderId);
        } else {
          initOrderDetail(goodsInfos);
        }
      }

      init();

      function isValidOrderInfo() {
        if (!$scope.pageData.orderDetail.in_store_deal) {
          if (!$scope.pageData.orderDetail.contact) {
            $scope.$emit(GlobalEvent.onShowAlert, '请填写收货信息！');
            return false;
          }
          if (!$scope.pageData.orderDetail.contact.name) {
            $scope.$emit(GlobalEvent.onShowAlert, '请填写收货人！');
            return false;
          }
          if (!$scope.pageData.orderDetail.contact.address) {
            $scope.$emit(GlobalEvent.onShowAlert, '请填写收货地址！');
            return false;
          }
          if (!$scope.pageData.orderDetail.contact.mobile_phone) {
            $scope.$emit(GlobalEvent.onShowAlert, '请填写收货电话！');
            return false;
          }
        }
        return true;
      }

      $scope.submitOrder = function () {

        var valid = isValidOrderInfo();
        if (!valid) {
          return;
        }

        $scope.$emit(GlobalEvent.onShowLoading, true);
        OrderService.createOrder($scope.pageData.orderDetail, function (err, data) {

          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err || !data || !data.order || !data.client) {
            return $scope.$emit(GlobalEvent.onShowAlert, '订单生成失败！请刷新页面重试' + err);
          }

          $scope.pageData.orderDetail.order_number = data.order.order_number;
          $scope.pageData.orderDetail._id = data.order._id;
          $scope.pageData.orderDetail.status = data.order.status;

          $stateParams.order_id = $scope.pageData.orderDetail._id;
          $scope.pageData.scan = true;

          Auth.setUser(data.client);
          console.log(data.client);
          $scope.$emit(GlobalEvent.onCartCountChange, data.client);
          $scope.$emit(GlobalEvent.onShowAlert, '订单创建成功！');

          return $state.go('payment', {order_id: data.order._id});
        });
      };

      $scope.goState = function(state, param){
        if(state){
          return $state.go(state, param);
        }
      };

      $scope.goMyCart = function(){
        $state.go('my_cart');
      };

      $scope.translateOrderStatus = function(){
        return OrderService.translateOrderStatus($scope.pageData.orderDetail.status);
      };
    }]);
