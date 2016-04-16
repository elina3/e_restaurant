/**
 * Created by elinaguo on 16/3/16.
 */
'use strict';
angular.module('EWeb').controller('GoodsManagerController',
  ['$scope', '$stateParams', '$window', '$rootScope',  'GlobalEvent', '$state', 'GoodsService',
    function ($scope, $stateParams, $window, $rootScope, GlobalEvent, $state, GoodsService) {

      $scope.pageConfig = {
        title: '',
        type: '',
        currentTag: 'goods',
        scanType: '',
        goodsPanel: {
          currentEditGoods: null,
          pagination: {
            currentPage: 1,
            limit: 10,
            totalCount: 0
          },
          errorInfo: {
            name: false,
            display_photos: false,
            price: false
          },
          goodsList: []
        },
        orderPanel: {
          pagination: {
            currentPage: 1,
            limit: 10,
            totalCount: 0
          },
          orderList: []
        },
        panel: {
          showMask: false,
          showGoodsEdit: false,
          showOrderEdit: false,
          showGoodsScan: false,
          showOrderScan: false
        }
      };

      $scope.goBack = function () {
        $state.go('user_index');
      };

      $scope.addGoods = function(){
        $state.go('goods_add');
      };

      $scope.changeTag = function(tagName){
        $scope.pageConfig.currentTag = tagName;
      };

      function initPageConfig(){
        switch($stateParams.goods_type){
          case 'goods':
            $scope.pageConfig.title = '超市管理';
            $scope.pageConfig.type = 'supermarket';
            return;
          case 'dish':
            $scope.pageConfig.title = '餐厅管理';
            $scope.pageConfig.type = 'restaurant';
            return;
          default:
            $scope.pageConfig.title = '餐厅管理';
            $scope.pageConfig.type = 'restaurant';
            return;
        }
      }

      function getGoodsList(){

      }

      function getNewGoodsObj(){
        return {
          name: '',
          description: '',
          status: 'none',
          price: 0,
          discount: 1,
          display_photos: [],
          description_photos: []
        };
      }

      $scope.clearMask = function(){
        $scope.pageConfig.panel.showMask = false;
        $scope.pageConfig.panel.showGoodsEdit = false;
        $scope.pageConfig.panel.showOrderEdit = false;
        $scope.pageConfig.panel.showGoodsScan = false;
        $scope.pageConfig.panel.showOrderScan = false;
      };

      $scope.showEditGoodsPanel = function(goods){
        $scope.pageConfig.panel.showGoodsEdit = true;
        $scope.pageConfig.panel.showMask = true;
        if(!goods){
          $scope.pageConfig.goodsPanel.currentEditGoods = getNewGoodsObj();
        }
      };

      function validGoodsInfo(){
        var isValid = true;
        if(!$scope.pageConfig.goodsPanel.currentEditGoods.name){
          $scope.pageConfig.goodsPanel.errorInfo.name = true;
          isValid = false;
        }

        if(!$scope.pageConfig.goodsPanel.currentEditGoods.price || parseInt($scope.pageConfig.goodsPanel.currentEditGoods.price) < 0){
          $scope.pageConfig.goodsPanel.errorInfo.price = true;
          isValid = false;
        }

        if(!$scope.pageConfig.goodsPanel.currentEditGoods.display_photos || $scope.pageConfig.goodsPanel.currentEditGoods.display_photos.length === 0){
          $scope.pageConfig.goodsPanel.errorInfo.display_photos = true;
          isValid = false;
        }

        return isValid;
      }

      $scope.createOrEditGoods = function(isCreate){
        if(!validGoodsInfo()){
          return;
        }

        //if(isCreate){
        //  GoodsService.createGoods($scope.pageConfig.goodsPanel.currentEditGoods, function(err, data){
        //    if(err){
        //
        //    }
        //
        //
        //  });
        //}else{
        //  GoodsService.modifyGoods($scope.pageConfig.goodsPanel.currentEditGoods, function(err, data){
        //    if(err){
        //
        //    }
        //
        //
        //  });
        //}
      };

      $scope.translateGoodsStatus = function(status){
        return GoodsService.translateGoodsStatus(status);
      };

      function init(){
        initPageConfig();
      }

      init();



      //
      //var fileUploadObj;
      //function uploadStart(file) {
      //  if (!fileUploadObj) {
      //    fileUploadObj = {
      //      file: null,
      //      upload: null,
      //      progress: {p: 0},
      //      img: ''
      //    };
      //  }
      //  fileUploadObj.file = file;
      //  fileUploadObj.upload = null;
      //  uploadHandle();
      //}
      //
      //function uploadHandle() {
      //  var compressOption = {
      //    cpmpressMaxSize: 30,
      //    quality: 70
      //  };
      //  fileUploadObj.upload = QiNiuService.upload({
      //    file: fileUploadObj.file
      //  }, compressOption);
      //  fileUploadObj.upload.then(function (response) {
      //    //response.key
      //    fileUploadObj.img = Config.qiniuServerAddress + '/' + response.key;
      //  }, function (err) {
      //    $scope.$emit(GlobalEvent.onShowAlert, {content: err});
      //  });
      //}
    }]);
