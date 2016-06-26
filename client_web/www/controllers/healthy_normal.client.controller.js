/**
 * Created by elinaguo on 16/6/26.
 */
'use strict';
angular.module('EClientWeb').controller('HealthyNormalController',
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
    'HealthyMealService',
    function ($rootScope,
              $scope,
              $state,
              $window,
              ResourcesService,
              GoodsService,
              ClientService,
              GlobalEvent,
              Auth,
              HealthyMealService) {

      $scope.pageData = {
        mealTags: [{id: 'breakfast', text: '早餐'}, {id: 'lunch', text: '午餐'}, {id: 'dinner', text: '晚餐'}],
        title: '首页',
        headConfig: {
          title: '瑞金医院古北分院餐厅',
          backView: '／',
          backShow: false
        },
        goodsList: [],
        pagination: {
          skipCount: 0,
          totalCount: 0,
          limit: 20
        },
        bedMealRecords: [],
        floors: [],
        hospitalized_info: null
      };

      $scope.filter = {
        currentIdNumber: '',
        currentMealTag: null,
        currentFloor: null,
        currentBuilding: null,
        currentBedMealRecord: null,
        search: function(){

        },
        saveBill: function(){
          if(!$scope.pageData.hospitalized_info){
            return $scope.$emit(GlobalEvent.onShowAlert, '请选择床位');
          }

          if(!$scope.filter.currentFloor){
            return $scope.$emit(GlobalEvent.onShowAlert, '请选择楼层');
          }

          var selectedGoodsList = $scope.pageData.goodsList.filter(function(item){
            return item.count && item.count > 0;
          });

          var goodsInfos = selectedGoodsList.map(function(item){
            return {
              goods_id: item._id,
              count: item.count
            };
          });

          if(goodsInfos.length === 0){
            return $scope.$emit(GlobalEvent.onShowAlert, '请选餐');
          }

          HealthyMealService.createNewBill({
            building_id: $scope.filter.currentBuilding.id,
            floor_id: $scope.filter.currentFloor.id,
            goods_infos: goodsInfos,
            bed_meal_record_id: $scope.filter.currentBedMealRecord.bed_meal_record_id,
            meal_tag: $scope.filter.currentMealTag.id
          }, function(err, data){
            if(err || !data || !data.success){
              return $scope.$emit(GlobalEvent.onShowAlert, err || '保存失败');
            }
            $scope.$emit(GlobalEvent.onShowAlert, '保存成功');
            selectedGoodsList.forEach(function(item){
              item.count = 0;
            });
            $scope.filter.currentBedMealRecord = null;
            $scope.pageData.hospitalized_info = null;
          });
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

      function loadGoods(){
        $scope.$emit(GlobalEvent.onShowLoading, true);
        GoodsService.getHealthyNormalGoodsList({
          currentPage: $scope.pageData.pagination.currentPage,
          limit: $scope.pageData.pagination.limit,
          skipCount: $scope.pageData.pagination.skipCount
        }, function(err, data){
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

      function loadBedMealRecord(buildingId, floorId, mealTag, callback){
        $scope.pageData.hospitalized_info = null;
        HealthyMealService.getHealthyNormalBedMealRecordByFloorToday({
          building_id: buildingId,
          floor_id: floorId,
          meal_tag: mealTag
        }, function(err, data){
          if(err || !data){
            return $scope.$emit(GlobalEvent.onShowAlert, err || '查询出错');
          }

          if(data.bed_meal_records){
            $scope.pageData.bedMealRecords = data.bed_meal_records.map(function(item){
              return {
                id: item.bed._id,
                text: item.bed.name,
                bed_meal_record_id: item._id,
                bed: item.bed,
                hospitalized_info: item.hospitalized_info
              };
            });
          }
          $scope.filter.currentBedMealRecord = null;
          $scope.pageData.hospitalized_info = null;
        });
      }

      $scope.onMealTagChange = function(){
        $scope.filter.currentFloor = null;
        $scope.filter.currentBedMealRecord = null;
        $scope.pageData.hospitalized_info = null;
      };

      $scope.onFloorChange = function(){
        if (!$scope.filter.currentFloor) {
          return $scope.$emit(GlobalEvent.onShowAlert, '请选择当前楼层');
        }
        if(!$scope.filter.currentMealTag){
          return $scope.$emit(GlobalEvent.onShowAlert, '请选择就餐类型');
        }

        loadBedMealRecord($scope.filter.currentBuilding.id, $scope.filter.currentFloor.id, $scope.filter.currentMealTag.id);
      };

      $scope.onBedChange = function(){
        if(!$scope.filter.currentBedMealRecord){
          return;
        }
        $scope.pageData.hospitalized_info = $scope.filter.currentBedMealRecord.hospitalized_info;
      };


      function init(){
        getClient();

        HealthyMealService.getBuildings(function(err, data){
          if(data && data.buildings && data.buildings.length > 0){
            var firstBuilding = data.buildings[0];
            $scope.filter.currentBuilding = {
              id: firstBuilding._id,
              text: firstBuilding.name
            };

            HealthyMealService.getFloorsByBuildingId(firstBuilding._id, function(err, data){
              if(data && data.floors && data.floors.length > 0){
                $scope.pageData.floors = data.floors.map(function(item){
                  return {
                    id: item._id,
                    text: item.name
                  };
                });
              }
            });
          }
        });

        loadGoods();
      }

      init();

      $scope.loadMore = function(){
        loadGoods();
      };
    }]);
