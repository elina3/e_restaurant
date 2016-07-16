/**
 * Created by elinaguo on 16/7/16.
 */
'use strict';
angular.module('EClientWeb').controller('HealthyMealController',
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
    'MealRecordService',
    function ($rootScope,
              $scope,
              $state,
              $window,
              ResourcesService,
              GoodsService,
              ClientService,
              GlobalEvent,
              Auth,
              HealthyMealService,
              MealRecordService) {

      $scope.pageData = {
        dateTags: [{id: 'today', text: '今天'}, {id: 'tomorrow', text: '明天'}],
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
        currentDateTag: '',
        currentMealTag: null,
        currentFloor: null,
        currentBuilding: null,
        currentBedMealRecord: null,
        search: function () {

        },
        saveBill: function () {
          if (!$scope.pageData.hospitalized_info) {
            return $scope.$emit(GlobalEvent.onShowAlert, '请选择床位');
          }

          if (!$scope.filter.currentFloor) {
            return $scope.$emit(GlobalEvent.onShowAlert, '请选择楼层');
          }

          var selectedPackageMeals = $scope.pageData.hospitalized_info.meal_type.package_meals.filter(function (item) {
            return item.count && item.count > 0;
          });

          var packageMeals = selectedPackageMeals.map(function (item) {
            return {
              name: item.name,
              count: item.count,
              selected: true
            };
          });

          if (packageMeals.length === 0) {
            return $scope.$emit(GlobalEvent.onShowAlert, '请选餐');
          }

          MealRecordService.saveMealSetting({
            package_meals: packageMeals,
            bed_meal_record_id: $scope.filter.currentBedMealRecord.bed_meal_record_id,
            hospitalized_info_id: $scope.pageData.hospitalized_info._id,
            meal_type_id: $scope.pageData.hospitalized_info.meal_type._id
          }, function (err, data) {
            if (err || !data || !data.bed_meal_record) {
              return $scope.$emit(GlobalEvent.onShowAlert, err || '保存失败');
            }
            $scope.$emit(GlobalEvent.onShowAlert, '保存成功');
            selectedPackageMeals.forEach(function (item) {
              item.count = 0;
            });
            $scope.filter.currentBedMealRecord = null;
            $scope.pageData.hospitalized_info = null;
          });
        }
      };

      $scope.generatePhotoSrc = function (packageMeal) {
        if (packageMeal && packageMeal.display_photos && packageMeal.display_photos.length > 0) {
          return ResourcesService.getImageUrl(packageMeal.display_photos[0]);
        }
        return '';
      };

      $scope.goToView = function (viewPage, param) {
        switch (viewPage) {
          case 'goodsDetail':
            $state.go('goods_detail', param);
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

      function getClient() {
        var client = Auth.getUser();
        if (!client) {
          $scope.$emit(GlobalEvent.onShowAlert, '亲，请登录！');
          $state.go('sign_in');
          return null;
        }
        return client;
      }

      $scope.onDateTagChange = function () {
        $scope.filter.currentFloor = null;
        $scope.filter.currentMealTag = null;
        $scope.filter.currentBedMealRecord = null;
        $scope.pageData.hospitalized_info = null;
      };
      $scope.onMealTagChange = function () {
        $scope.filter.currentFloor = null;
        $scope.filter.currentBedMealRecord = null;
        $scope.pageData.hospitalized_info = null;
      };

      $scope.onFloorChange = function () {

        if (!$scope.filter.currentDateTag) {
          return $scope.$emit(GlobalEvent.onShowAlert, '请选择时间');
        }
        if (!$scope.filter.currentFloor) {
          return $scope.$emit(GlobalEvent.onShowAlert, '请选择当前楼层');
        }
        if (!$scope.filter.currentMealTag) {
          return $scope.$emit(GlobalEvent.onShowAlert, '请选择就餐类型');
        }

        loadMealSettingFilter($scope.filter.currentBuilding.id, $scope.filter.currentFloor.id, $scope.filter.currentMealTag.id, $scope.filter.currentDateTag.id);
      };

      $scope.onBedChange = function () {
        if (!$scope.filter.currentBedMealRecord) {
          return;
        }
        $scope.pageData.hospitalized_info = $scope.filter.currentBedMealRecord.hospitalized_info;
      };

      function loadMealSettingFilter(buildingId, floorId, mealTag, mealSetDateTag) {
        MealRecordService.getMealSettingFilter({
          building_id: buildingId,
          floor_id: floorId,
          meal_tag: mealTag,
          date_tag: mealSetDateTag
        }, function (err, data) {
          if (err || !data || !data.bed_meal_records) {
            return;
          }

          $scope.pageData.bedMealRecords = data.bed_meal_records.map(function (item) {
            return {
              id: item.bed._id,
              text: item.bed.name,
              bed_meal_record_id: item._id,
              bed: item.bed,
              hospitalized_info: {
                _id: item.hospitalized_info,
                id_number: item.id_number,
                nickname: item.nickname,
                meal_type: item.meal_type_id
              }
            };
          });
          $scope.filter.currentBedMealRecord = null;
          $scope.pageData.hospitalized_info = null;
        });
      }

      function init() {
        getClient();
        $scope.filter.currentDateTag = {id: 'today', text: '今天'};
        $scope.filter.currentMealTag = {id: 'breakfast', text: '早餐'};

        HealthyMealService.getBuildings(function (err, data) {
          if (data && data.buildings && data.buildings.length > 0) {
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

                $scope.filter.currentFloor = $scope.pageData.floors[0];

                loadMealSettingFilter(firstBuilding._id, $scope.filter.currentFloor.id, $scope.filter.currentMealTag.id, $scope.filter.currentDateTag.id);
              }
            });
          }
        });
      }

      init();
    }]);
