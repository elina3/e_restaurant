/**
 * Created by elinaguo on 16/4/9.
 */
'use strict';
angular.module('EClientWeb').controller('MyCartController',
  [
    '$rootScope',
    '$scope',
    '$state',
    '$window',
    '$location',
    'Auth',
    'ResourcesService',
    'ClientService',
    'GlobalEvent',
    'MyCartError',
    function ($rootScope,
              $scope,
              $state,
              $window,
              $location,
              Auth,
              ResourcesService,
              ClientService,
              GlobalEvent,
              MyCartError) {

      function getClient(){
        var client = Auth.getUser();
        if(!client){
          $scope.$emit(GlobalEvent.onShowAlert, '亲，请登录！');
          $state.go('sign_in');
          return null;
        }
        return client;
      }

      //<editor-fold desc="购物车商品数量调整">
      $scope.numberChanged = function(cartGoods){
        if(!cartGoods.count){
          return;
        }
        try{
          cartGoods.count = parseInt(cartGoods.count);
        }
        catch(e){
          return;
        }

        var client = getClient();
        if(client){
          ClientService.updateGoodsCountToCart(client, cartGoods, cartGoods.count, function(err, data){
            if(err || !data.client){
              var errorMessage = MyCartError[err] || err;
              return $scope.$emit(GlobalEvent.onShowAlert,(errorMessage ? ',':'') + '加入购物车失败！');

            }
            if(data.client.cart){
              $scope.pageData.cart.total_price = data.client.cart.total_price;
            }
            $scope.$emit(GlobalEvent.onCartCountChange, data.client);
          });
        }
      };
      $scope.addNumber = function(cartGoods){
        cartGoods.count++;
        var client = getClient();
        if(client){
          ClientService.updateGoodsCountToCart(client, cartGoods, cartGoods.count, function(err, data){
            if(err || !data.client){
              var errorMessage = MyCartError[err] || err;
              return $scope.$emit(GlobalEvent.onShowAlert,(errorMessage ? ',':'') + '加入购物车失败！');
            }
            if(data.client.cart){
              $scope.pageData.cart.total_price = data.client.cart.total_price;
            }
            $scope.$emit(GlobalEvent.onCartCountChange, data.client);
          });
        }
      };
      $scope.minusNumber = function(cartGoods){
        if(cartGoods.count === 0){
          return;
        }
        cartGoods.count--;
        var client = getClient();
        if(client){
          ClientService.updateGoodsCountToCart(client, cartGoods, cartGoods.count, function(err, data){
            if(err || !data.client){
              var errorMessage = MyCartError[err] || err;
              return $scope.$emit(GlobalEvent.onShowAlert,(errorMessage ? ',':'') + '加入购物车失败！');
            }
            if(data.client.cart){
              $scope.pageData.cart.total_price = data.client.cart.total_price;
            }
            $scope.$emit(GlobalEvent.onCartCountChange, data.client);
          });
        }
      };
      $scope.deleteGoodsFormCart = function(cartGoods){
        var client = getClient();
        ClientService.removeGoodsFromCart(client, cartGoods, function(err, data){
          if(err || !data || !data.client){
            console.log(err);
            var errorMessage = MyCartError[err] || err;
            return $scope.$emit(GlobalEvent.onShowAlert,(errorMessage ? ',':'') + '移出购物车失败！');
          }

          if(data.client.cart){
            $scope.pageData.cart = data.client.cart;
          }else{
            $scope.pageData.cart.cart_goods = [];
            $scope.pageData.cart.total_price = 0;
          }
          $scope.$emit(GlobalEvent.onCartCountChange, data.client);
        });
      };
      //</editor-fold>

      $scope.generatePhotoSrc = function (photoKey) {
        if(photoKey){
          return ResourcesService.getImageUrl(photoKey);
        }
        return '';
      };

      $scope.pageData = {
        title: '我的购物车',
        headConfig: {
          title: '购物车',
          backView: '',
          backShow: true
        },
        goods: {
          count: 1
        },
        cart: {}
      };


      $scope.generateOrder = function(){
        var client = getClient();
        //ClientService.generateOrderSummary
      };


      function init(){
        var client = getClient();
        $scope.pageData.cart = client.cart;
      }

      init();

      $scope.goToView = function(viewPage){
        switch(viewPage){
          case 'orderDetail':
            $state.go('order_detail');
            break;
          case 'signIn':
            $state.go('sign_in');
            break;
        }
      };

    }]);
