/**
 * Created by elinaguo on 16/4/8.
 */
'use strict';
angular.module('EClientWeb').controller('HomeController',
  [
    '$rootScope',
    '$scope',
    '$state',
    '$window',
    'ResourcesService',
    'GoodsService',
    'ClientService',
    'GlobalEvent',
    'Auth',
    function ($rootScope,
              $scope,
              $state,
              $window,
              ResourcesService,
              GoodsService,
              ClientService,
              GlobalEvent,
              Auth) {

      $scope.pageData = {
        title: '首页',
        headConfig: {
          title: '瑞金古北分院食堂',
          backView: '／',
          backShow: false
        },
        goodsList: [],
        pagination: {
          skipCount: 0,
          totalCount: 0,
          limit: 20
        }
      };

      $scope.generatePhotoSrc = function (goods) {
        if(goods && goods.display_photos && goods.display_photos.length  > 0){
          return ResourcesService.getImageUrl(goods.display_photos[0]);
        }
        return '';
      };

      $scope.goToView = function(viewPage, param){
        switch(viewPage){
          case 'goodsDetail':
            $state.go('goods_detail' ,param);
            break;
          case 'freeMeal':
            $state.go('free_meal');
            break;
          case 'goodsCart':
            $state.go('my_cart');
            break;
          case 'myOrders':
            $state.go('my_orders');
            break;
          case 'signIn':
            $state.go('sign_in');
            break;
        }
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

      $scope.addToCart = function(goods, event){
        var client = getClient();
        if(client){

          $scope.$emit(GlobalEvent.onShowLoading, true);
          ClientService.addGoodsToCart(client, goods, 1, function(err, data){
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if(err){
              console.log(err);
              return $scope.$emit(GlobalEvent.onShowAlert, '加入购物车失败！');
            }

            $scope.$emit(GlobalEvent.onCartCountChange, data.client);
          });
        }

        if(event){
          if (event) {
            event.stopPropagation();
          }
        }
      };

      function loadGoods(){
        $scope.$emit(GlobalEvent.onShowLoading, true);
        GoodsService.getGoodsList($scope.pageData.pagination, function(err, data){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if(err){
            $scope.$emit(GlobalEvent.onShowAlert, err);
            return;
          }
          $scope.pageData.pagination.totalCount = data.total_count;
          $scope.pageData.pagination.skipCount += data.goods_list.length;
          $scope.pageData.pagination.limit = data.limit;
          $scope.pageData.goodsList = $scope.pageData.goodsList.concat(data.goods_list);
        });
      }

      function init(){
        loadGoods();
      }

      init();

      $scope.loadMore = function(){
        loadGoods();
      };
      $scope.buyNow = function(goods, event){
        var goodsInfos = [{
          _id: goods._id,
          count: 1
        }];
        $state.go('order_detail', {goods_infos: JSON.stringify(goodsInfos)});
        if(event){
          if (event) {
            event.stopPropagation();
          }
        }
      };
    }]);
