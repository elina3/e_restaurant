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
          backView: '/',
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

      $scope.scan = function(){
        alert('scan()');
        wx.scanQRCode({
          needResult: 0, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
          scanType: ['qrCode','barCode'], // 可以指定扫二维码还是一维码，默认二者都有
          success: function (res) {
            var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
            alert(JSON.stringify(result));
          }
        });
      };

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
          price = parseFloat(numberString);
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
        OrderService.card($scope.pageData.card_number, function(err, data){
          if (err || !data || !data.card){
            $scope.$emit(GlobalEvent.onShowLoading, false);
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          OrderService.createOrder(orderDetail, function (err, data) {
            if (err || !data || !data.order || !data.client){
              $scope.$emit(GlobalEvent.onShowLoading, false);
              return $scope.$emit(GlobalEvent.onShowAlert, '订单生成失败！请刷新页面重试' + err);
            }

            Auth.setUser(data.client);
            $scope.$emit(GlobalEvent.onCartCountChange, data.client);
            var orderNumber = data.order.order_number;

            OrderService.freeMealPay(data.order._id,
              $scope.pageData.card_number,
              orderDetail.total_price, function(err, data){

                $scope.$emit(GlobalEvent.onShowLoading, false);
                if(err){
                  return $scope.$emit(GlobalEvent.onShowAlert, err);
                }
                console.log(data);

                var payment = data.payment.payment;
                var money = data.payment.cardInfo.amount;//余额
                var message = '原价'+payment.total_amount+'元，实付'+payment.amount+'元，卡内余额'+money+'元！';
                $scope.$emit(GlobalEvent.onShowAlert, message);
                $scope.pageData.card_number = '';
              });
          });
        });
      };

      function init(){
        getClient();
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
