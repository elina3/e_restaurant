/**
 * Created by elinaguo on 16/4/9.
 */
'use strict';
angular.module('EClientWeb').controller('FreeMealController',
  [
    '$rootScope',
    '$scope',
    '$state',
    '$window',
    '$stateParams',
    'GlobalEvent',
    'GoodsService',
    'ResourcesService',
    'ClientService',
    'Auth',
    'OrderService',
    function ($rootScope,
              $scope,
              $state,
              $window,
              $stateParams,
              GlobalEvent,
              GoodsService,
              ResourcesService,
              ClientService,
              Auth,
              OrderService) {

      $scope.pageData = {
        title: '自由餐页面',
        headConfig: {
          title: '自由餐页面',
          backView: '',
          backShow: true
        },
        card_number: '',
        price: 0,
        goods: null,
        count: 1
      };

      function getClient(){
        var client = Auth.getUser();
        if(!client){
          $scope.$emit(GlobalEvent.onShowAlert, '亲，请登录！');
          $state.go('sign_in');
          return null;
        }
        return client;
      }

      $scope.generatePhotoSrc = function (photoKey) {
        if(photoKey){
          return ResourcesService.getImageUrl(photoKey);
        }
        return '';
      };

      $scope.addNumber = function(){
        $scope.pageData.count = parseInt($scope.pageData.count);
        $scope.pageData.count++;
      };
      $scope.minusNumber = function(){
        $scope.pageData.count = parseInt($scope.pageData.count);
        $scope.pageData.count--;
      };

      function parseNumber(numberString){
        var price = 0;
        try{
          price = parseFloat(numberString) || 0;
          price = isNaN(price) ? 0 : price;
          if(price <= 0){
            return 0;
          }
        }catch(e){
          price = 0;
        }
        return price;
      }
      $scope.pay = function(){
        if(!$scope.pageData.card_number){
          return $scope.$emit(GlobalEvent.onShowAlert, '请输入卡号');
        }
        if(!$scope.pageData.price){
          return $scope.$emit(GlobalEvent.onShowAlert, '请输入单价');
        }
        var price = parseNumber($scope.pageData.price);
        if(price <= 0){
          return $scope.$emit(GlobalEvent.onShowAlert, '请输入正确的价格');
        }
        var count = parseNumber($scope.pageData.count);
        if(count <= 0){
          return $scope.$emit(GlobalEvent.onShowAlert, '请输入正确的数量');
        }

        var orderDetail = {
          status: 'prepare',
          goods_infos: [{
              _id: $scope.pageData.goods._id,
              name: $scope.pageData.goods.name,
              description: $scope.pageData.goods.description,
              price: price,
              count: count,
              display_photos: $scope.pageData.goods.display_photos
            }],
          in_store_deal: true,
          total_price: price  * count,
          description: '甜不辣'
        };
        $scope.$emit(GlobalEvent.onShowLoading, true);
        OrderService.createOrder(orderDetail, function (err, data) {
          if (err || !data || !data.order || !data.client){
            $scope.$emit(GlobalEvent.onShowLoading, false);
            return $scope.$emit(GlobalEvent.onShowAlert, '订单生成失败！请刷新页面重试' + err);
          }

          Auth.setUser(data.client);
          $scope.$emit(GlobalEvent.onCartCountChange, data.client);
          var orderNumber = data.order.order_number;

          OrderService.pay(data.order._id,
            $scope.pageData.card_number,
            orderDetail.total_price, function(err, data){

              $scope.$emit(GlobalEvent.onShowLoading, false);
              if(err){
                return $scope.$emit(GlobalEvent.onShowAlert, err);
              }
              console.log(data);

              var money = data.payment.cardInfo.money;
              $scope.$emit(GlobalEvent.onShowAlert, '您的订单['+orderNumber+']支付成功!     您的卡号['+$scope.pageData.card_number+']扣款'+orderDetail.total_price+'元!    卡内余额：' + money + '元！');
              $scope.pageData.card_number = '';
            });
        });
      };

      function init(){
        $scope.$emit(GlobalEvent.onShowLoading, true);
        GoodsService.getFirstFreeMealGoodsDetail(function(err,data){

          $scope.$emit(GlobalEvent.onShowLoading, true);
          if(err){
            return $scope.$emit(GlobalEvent.onShowAlert, '获取商品详情失败，请刷新页面重试！');
          }

          $scope.pageData.goods = data.goods;
          $scope.pageData.price = data.goods.price;
        });
      }
      init();


    }]);
