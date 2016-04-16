/**
 * Created by elinaguo on 16/3/16.
 */
'use strict';
angular.module('EWeb').controller('GoodsManagerController',
  ['$scope', '$stateParams', '$window', '$rootScope',  'GlobalEvent', '$state', 'GoodsService', 'QiNiuService', 'Config',
    function ($scope, $stateParams, $window, $rootScope, GlobalEvent, $state, GoodsService, QiNiuService, Config) {

      $scope.pageConfig = {
        qiniuToken: '',
        title: '',
        type: '',
        currentTag: 'goods',
        scanType: '',
        goodsPanel: {
          currentEditGoods: null,
          newCreate: false,
          pagination: {
            currentPage: 1,
            limit: 2,
            totalCount: 0,
            onCurrentPageChanged: function (callback) {
              loadGoodsList();
            }
          },
          errorInfo: {
            name: false,
            display_photos: false,
            price: false
          },
          goodsList: [],
          goodsStatuses: [{id: 'none', text: '未开放'},{id: 'sold_out', text: '售罄'}, {id: 'on_sale', text: '热卖中'}]
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

      function loadGoodsList(){
        $scope.pageConfig.goodsPanel.goodsList = [];
        GoodsService.getGoodsList($scope.pageConfig.goodsPanel.pagination, function(err, data){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err) {
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          data.goods_list.forEach(function(goods){
            var goodsObj = {
              _id: goods._id,
              name: goods.name,
              price: goods.price,
              unit: goods.unit,
              discount: goods.discount,
              description: goods.description,
              display_photos: [],
              description_photos: [],
              statusObj: {id: goods.status, text: GoodsService.translateGoodsStatus(goods.status)}
            };

            if(goods.display_photos && goods.display_photos.length > 0){
              goods.display_photos.forEach(function(photoKey){
                goodsObj.display_photos.push({
                  img: generalImgUrl(photoKey),
                  photo_key: photoKey
                });
              });
            }

            if(goods.description_photos && goods.description_photos.length > 0){
              goods.description_photos.forEach(function(photoKey){
                goodsObj.description_photos.push({
                  img: generalImgUrl(photoKey),
                  photo_key: photoKey
                });
              });
            }
            $scope.pageConfig.goodsPanel.goodsList.push(goodsObj);
          });

          $scope.pageConfig.goodsPanel.pagination.totalCount = data.total_count;
          $scope.pageConfig.goodsPanel.pagination.limit = data.limit;
          $scope.pageConfig.goodsPanel.pagination.pageCount = Math.ceil($scope.pageConfig.goodsPanel.pagination.totalCount / $scope.pageConfig.goodsPanel.pagination.limit);

        });
      }

      $scope.goBack = function () {
        $state.go('user_index');
      };

      $scope.addGoods = function(){
        $state.go('goods_add');
      };

      $scope.changeTag = function(tagName){
        $scope.pageConfig.currentTag = tagName;
      };

      function getNewGoodsObj(){
        return {
          name: '',
          description: '',
          statusObj: {id: 'none', text: '未开放'},
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
          $scope.pageConfig.goodsPanel.newCreate = true;
        }else{
          $scope.pageConfig.goodsPanel.currentEditGoods = goods;
          $scope.pageConfig.goodsPanel.newCreate = false;
        }
      };
      $scope.closeEditGoodsPanel = function(){
        $scope.pageConfig.panel.showGoodsEdit = false;
        $scope.pageConfig.panel.showMask = false;

        $scope.pageConfig.goodsPanel.currentEditGoods = null;
        $scope.pageConfig.goodsPanel.newCreate = true;
      };

      function validGoodsInfo(){
        var isValid = true;
        if(!$scope.pageConfig.goodsPanel.currentEditGoods.name){
          $scope.pageConfig.goodsPanel.errorInfo.name = true;
          isValid = false;
        }

        if(!$scope.pageConfig.goodsPanel.currentEditGoods.display_photos || $scope.pageConfig.goodsPanel.currentEditGoods.display_photos.length === 0){
          $scope.pageConfig.goodsPanel.errorInfo.display_photos = true;
          isValid = false;
        }

        return isValid;
      }
      function handleValidError(){
        if($scope.pageConfig.goodsPanel.errorInfo.name){
          $scope.$emit(GlobalEvent.onShowAlert, '请输入商品名');
        }
        try{
          if($scope.pageConfig.goodsPanel.currentEditGoods.price){
            var price = parseFloat($scope.pageConfig.goodsPanel.currentEditGoods.price);
            if(price < 0){
              $scope.$emit(GlobalEvent.onShowAlert, '请输入正确的价格');
            }
          }
        }catch(e){
          $scope.$emit(GlobalEvent.onShowAlert, '请输入正确的价格');
        }
        if($scope.pageConfig.goodsPanel.errorInfo.display_photos){
          $scope.$emit(GlobalEvent.onShowAlert, '请至少选择一行显示照片');
        }
      }

      function generateUploadGoodsInfo(){
        var goodsInfo = {
          _id: $scope.pageConfig.goodsPanel.currentEditGoods._id,
          name: $scope.pageConfig.goodsPanel.currentEditGoods.name,
          status: $scope.pageConfig.goodsPanel.currentEditGoods.statusObj.id,
          price: parseFloat($scope.pageConfig.goodsPanel.currentEditGoods.price),
          unit: '个',
          discount: 1,
          description: $scope.pageConfig.goodsPanel.currentEditGoods.description,
          display_photos: [],
          description_photos: []
        };

        if($scope.pageConfig.goodsPanel.currentEditGoods.display_photos && $scope.pageConfig.goodsPanel.currentEditGoods.display_photos.length > 0){
          $scope.pageConfig.goodsPanel.currentEditGoods.display_photos.forEach(function(photo){
            goodsInfo.display_photos.push(photo.photo_key);
          });
        }
        if($scope.pageConfig.goodsPanel.currentEditGoods.description_photos && $scope.pageConfig.goodsPanel.currentEditGoods.description_photos.length > 0){
          $scope.pageConfig.goodsPanel.currentEditGoods.description_photos.forEach(function(photo){
            goodsInfo.description_photos.push(photo.photo_key);
          });
        }

        return goodsInfo;
      }

      $scope.saveGoods = function(){
        if(!validGoodsInfo()){
          handleValidError();
          return;
        }

        var uploadGoodsInfo = generateUploadGoodsInfo();
        if($scope.pageConfig.goodsPanel.newCreate){
          GoodsService.createGoods(uploadGoodsInfo, function(err, data){
            if(err){
              $scope.$emit(GlobalEvent.onShowAlert, '创建失败！错误：' + err);
              return;
            }
            $scope.$emit(GlobalEvent.onShowAlert, '新建商品成功！');
            $scope.closeEditGoodsPanel();
            $state.reload();
          });
        }else{
          GoodsService.modifyGoods(uploadGoodsInfo, function(err, data){
            if(err){
              $scope.$emit(GlobalEvent.onShowAlert, '修改商品失败！错误：' + err);
              return;
            }
            $scope.$emit(GlobalEvent.onShowAlert, '修改商品成功！');
            $scope.closeEditGoodsPanel();
            $state.reload();
          });
        }
      };
      $scope.resetGoods = function(){
        $scope.pageConfig.goodsPanel.currentEditGoods = getNewGoodsObj();
      };
      $scope.deleteGoods = function(goods){
        GoodsService.deleteGoods(goods._id, function(err, data){
          if(err){
            $scope.$emit(GlobalEvent.onShowAlert, '删除失败！错误：' + err);
            return;
          }
          $scope.$emit(GlobalEvent.onShowAlert, '删除商品成功！');
          $scope.closeEditGoodsPanel();
          $state.reload();
        });
      };
      $scope.translateGoodsStatus = function(status){
        return GoodsService.translateGoodsStatus(status);
      };


      function initPageConfig(){
        switch($stateParams.goods_type){
          case 'goods':
            $scope.pageConfig.title = '超市管理';
            $scope.pageConfig.type = 'supermarket';
            break;
          case 'dish':
            $scope.pageConfig.title = '餐厅管理';
            $scope.pageConfig.type = 'restaurant';
            break;
          default:
            $scope.pageConfig.title = '餐厅管理';
            $scope.pageConfig.type = 'restaurant';
            break;
        }

        $scope.$emit(GlobalEvent.onShowLoading, true);
        QiNiuService.qiNiuKey(function(err, data){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if(err){
            console.log(err);
            return;
          }

          console.log(data);
          $scope.pageConfig.qiniuToken = data.token;
        });
      }
      function init(){
        initPageConfig();
        loadGoodsList();
      }

      init();

      //<editor-fold desc="图片上传相关">
      function generalImgUrl(imgName) {
        return Config.qiniuServerAddress + imgName;
      }

      function start(index, target) {
        target[index].progress = {
          p: 0
        };
        target[index].upload = QiNiuService.upload({
          file: target[index].file,
          token: $scope.pageConfig.qiniuToken
        });
        target[index].upload.then(function (response) {
          target[index].img = generalImgUrl(response.key);
          target[index].photo_key = response.key;
        }, function (response) {
          alert(response);
          console.log(response);
        }, function (evt) {
          target[index].progress.p = Math.floor(100 * evt.loaded / evt.totalSize);
        });
      }

      $scope.onFileSelect = function ($files, target) {
        var offsetx = target.length;
        for (var i = 0; i < $files.length; i++) {
          target[i + offsetx] = {
            file: $files[i]
          };
          start(i + offsetx, target);
        }
      };

      $scope.abort = function (index, target) {
        if (target[index].upload) {
          //待修改的，非上传图片属性不会有这个属性
          target[index].upload.abort();
        }
        target.splice(index, 1);
      };
      //</editor-fold>
    }]);
