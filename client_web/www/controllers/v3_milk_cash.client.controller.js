'use strict';
angular.module('EClientWeb').controller('MilkCashController',
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
    'MilkOrderService',
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
              OrderService,
              MilkOrderService) {

      $scope.pageData = {
        title: '牛奶棚收银页面',
        headConfig: {
          title: '牛奶棚收银页面',
          backView: '/',
          backShow: true
        },
        headMenuList: [],
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

      $scope.alertMessage = {
        show: false,
        content: ''
      };
      function showAlertMessage(message,message2,message3,message4){
        $scope.alertMessage.show = true;
        $scope.alertMessage.content = message;
        $scope.alertMessage.content2 = message2;
        $scope.alertMessage.content3 = message3;
        $scope.alertMessage.content4 = message4;
      }
      $scope.closeAlertMessage = function(){
        $scope.alertMessage.show = false;
        $scope.alertMessage.content = '';
        $scope.alertMessage.content2 = '';
        $scope.alertMessage.content3 = '';
        $scope.alertMessage.content4 = '';
        $('#cardInput').focus();
      };
      var isPaying = false;
      $scope.pay = function(){
        if(!$scope.pageData.card_number){
          $('#cardInput').focus();
          return showAlertMessage('请输入卡号！');
        }
        if(!$scope.pageData.price){
          $('#priceInput').focus();
          return showAlertMessage('请输入金额！');
        }
        var price = parseNumber($scope.pageData.price);
        if(price <= 0){
          $('#priceInput').focus();
          return showAlertMessage('请输入正确的价格！');
        }
        var count = parseNumber($scope.pageData.count);
        if(count <= 0){
          return showAlertMessage('请输入正确的数量！');
        }

        $scope.$emit(GlobalEvent.onShowLoading, true);
        isPaying = true;
        OrderService.card($scope.pageData.card_number, function(err, data){
          if (err || !data || !data.card){
            $('#cardInput').focus();
            isPaying = false;
            $scope.$emit(GlobalEvent.onShowLoading, false);
            return showAlertMessage(err);
          }

          MilkOrderService.createMilkOrder({
            amount: price * 100,
            description: '',
            card_id: data.card._id
          }, function (err, data) {
            if (err || !data || !data.success){
              $('#cardInput').focus();
              $scope.$emit(GlobalEvent.onShowLoading, false);
              isPaying = false;
              return showAlertMessage(err || '订单生成失败！请刷新页面重试！');
            }

            $('#cardInput').focus();
            var balance = data.supermarket_current_balance === -1 ? -1 :( data.supermarket_current_balance/100);
            showAlertMessage(data.amount / 100, data.actual_amount / 100,
              balance,
              data.card_balance);
            $scope.pageData.price = '';
            $scope.pageData.card_number = '';
          });
        });
      };

      function keyUpEnter(){
        if($scope.alertMessage.show){
          $scope.closeAlertMessage();
          if(!$scope.pageData.price){
            $('#priceInput').focus();
          }
        }else{
          if(!isPaying){
            $scope.pay();
          }
        }
      }

      $scope.priceInputKeyup = function(event){
        var keycode = window.event?event.keyCode:event.which;
        if(keycode === 13){
          $('#cardInput').focus();
        }
      };

      $scope.cardInputKeyup = function(event){
        var keycode = window.event?event.keyCode:event.which;
        if(keycode===13){
          keyUpEnter(keycode);
        }
      };
      function init(){
        getClient();
        $('#priceInput').focus();
      }
      init();
    }]);
