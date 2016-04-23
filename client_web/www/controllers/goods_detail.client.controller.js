/**
 * Created by elinaguo on 16/4/9.
 */
'use strict';
angular.module('EClientWeb').controller('GoodsDetailController',
  [
    '$rootScope',
    '$scope',
    '$state',
    '$window',
    '$stateParams',
    'GoodsService',
    'GlobalEvent',
    'ResourcesService',
    'ClientService',
    'Auth',
    function ($rootScope,
              $scope,
              $state,
              $window,
              $stateParams,
              GoodsService,
              GlobalEvent,
              ResourcesService,
              ClientService,
              Auth) {

      $scope.pageData = {
        title: '商品详情',
        headConfig: {
          title: '商品详情',
          backView: '',
          backShow: true
        },
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
      $scope.addToCart = function(){
        var client = getClient();
        if(client){

          $scope.$emit(GlobalEvent.onShowLoading, true);
          ClientService.addGoodsToCart(client, $scope.pageData.goods, $scope.pageData.count, function(err, data){

            $scope.$emit(GlobalEvent.onShowLoading, false);
            if(err){
              console.log(err);
              return $scope.$emit(GlobalEvent.onShowAlert, '加入购物车失败！');
            }


            $scope.$emit(GlobalEvent.onCartCountChange, data.client);
          });
        }
      };
      $scope.buyNow = function(){
        var goodsInfos = [{
          _id: $scope.pageData.goods._id,
          count: $scope.pageData.count
        }];
        $state.go('order_detail', {goods_infos: JSON.stringify(goodsInfos)});
      };

      function init(){
        var goodsId = $stateParams.goods_id;

        $scope.$emit(GlobalEvent.onShowLoading, true);
        GoodsService.getGoodsDetail(goodsId, function(err,data){

          $scope.$emit(GlobalEvent.onShowLoading, true);
          if(err){
            return $scope.$emit(GlobalEvent.onShowAlert, '获取商品详情失败，请刷新页面重试！');
          }

          $scope.pageData.goods = data.goods;
        });
      }
      init();

    }]);
