/**
 * Created by elinaguo on 16/6/12.
 */
/**
 * Created by elinaguo on 16/5/2.
 */
'use strict';
angular.module('EWeb').controller('SetMealController',
  ['$scope', '$window', '$stateParams', '$rootScope', 'GlobalEvent', '$state', 'Auth', 'BedService', 'BedMealRecordService',
    function ($scope, $window, $stateParams, $rootScope, GlobalEvent, $state, Auth, BedService, BedMealRecordService) {

      var mealTypes = {
        normal: '普食',
        liquid_diets: '流质',
        semi_liquid_diets: '半流质',
        diabetic_diets: '糖尿病饮食',
        low_fat_low_salt_diets: '低脂低盐饮食'
      };

      $scope.filter = {
        currentBuilding: null,
        currentFloor: null,
        buildings: [],
        floors: [],
        mealTypes: [
          {id: 'healthy_normal', text: mealTypes.normal},
          {id: 'liquid_diets', text: mealTypes.liquid_diets},
          {id: 'semi_liquid_diets', text: mealTypes.semi_liquid_diets},
          {id: 'diabetic_diets', text: mealTypes.diabetic_diets},
          {id: 'low_fat_low_salt_diets', text: mealTypes.low_fat_low_salt_diets}
        ]
      };

      $scope.changeBuilding = function () {
        if ($scope.filter.currentBuilding) {
          BedService.getFloorsByBuildingId($scope.filter.currentBuilding.id, function (err, data) {
            if (data && data.floors) {
              $scope.filter.floors = [];

              data.floors.forEach(function (floor) {
                $scope.filter.floors.push({
                  id: floor._id,
                  text: floor.name
                });
              });
            }
          });
        }
      };

      $scope.changeFloor = function () {
      };

      $scope.beds = [];

      function getBed(record) {
        return $scope.beds.filter(function (item) {
          return item.id === record.bed;
        })[0];
      }
      function getTimeStamp(){
        if ($scope.pageShow.createTimeRange.startDate && $scope.pageShow.createTimeRange.startDate._d) {
          var time = moment($scope.pageShow.createTimeRange.startDate);
          return new Date(time).getTime();
        }
        return;
      }
      $scope.search = function () {
        if (!$scope.filter.currentFloor) {
          return $scope.$emit(GlobalEvent.onShowAlert, '请选择楼层信息');
        }

        var timeStamp = getTimeStamp();
        if(!timeStamp){
          return $scope.$emit(GlobalEvent.onShowAlert, '请选择时间！');
        }

        BedService.getBedsByFloorId($scope.filter.currentFloor.id, function (err, data) {
          if (data && data.beds) {
            $scope.beds = data.beds.map(function (item) {
              return {
                id: item._id,
                name: item.name,
                breakfast: null,
                lunch: null,
                dinner: null
              };
            });

            BedMealRecordService.getBedMealRecords({
              buildingId: $scope.filter.currentBuilding ? $scope.filter.currentBuilding.id : '',
              floorId: $scope.filter.currentFloor ? $scope.filter.currentFloor.id : '',
              timeStamp: timeStamp
            }, function (err, data) {
              if (data.bed_meal_records) {
                data.bed_meal_records.forEach(function (record) {
                  var bed = getBed(record);
                  if (bed) {
                    if (record.breakfast) {
                      bed.breakfast = {id: record.breakfast, text: mealTypes[record.breakfast]};
                    }
                    if (record.lunch) {
                      bed.lunch = {id: record.lunch, text: mealTypes[record.lunch]};
                    }
                    if (record.dinner) {
                      bed.dinner = {id: record.dinner, text: mealTypes[record.dinner]};
                    }
                  }
                });
              }
            });
          }
        });
      };
      $scope.applyYesterday = function () {

      };
      $scope.generateBill = function(){
        alert('bill');
      };
      $scope.saveMealSet = function () {
        var formattedBedMealInfos = $scope.beds.filter(function (bed) {
          if (bed.breakfast || bed.lunch || bed.dinner) {
            return bed;
          }
        });

        formattedBedMealInfos = formattedBedMealInfos.map(function (bed) {
          return {
            _id: bed.id,
            breakfast: bed.breakfast ? bed.breakfast.id : '',
            lunch: bed.lunch ? bed.lunch.id : '',
            dinner: bed.dinner ? bed.dinner.id : ''
          };
        });

        if (formattedBedMealInfos.length === 0) {
          return $scope.$emit(GlobalEvent.onShowAlert, '请至少设置一个床位的用餐信息！');
        }

        var timeStamp = getTimeStamp();
        if(!timeStamp){
          return $scope.$emit(GlobalEvent.onShowAlert, '请选择时间！');
        }

        $scope.$emit(GlobalEvent.onShowLoading, true);
        BedMealRecordService.saveBedMealRecords({
          buildingId: $scope.filter.currentBuilding ? $scope.filter.currentBuilding.id : '',
          floorId: $scope.filter.currentFloor ? $scope.filter.currentFloor.id : '',
          bedMealInfos: formattedBedMealInfos,
          timeStamp: timeStamp
        }, function (err, data) {
          $scope.$emit(GlobalEvent.onShowLoading, false);
          console.log(data);
        });
      };

      $scope.pageShow = {
        createTimeRange: '',
        createTimeMinTime: moment().format('YY/MM/DD'),
        dateOptions: {
          locale: {
            fromLabel: '起始时间',
            toLabel: '结束时间',
            cancelLabel: '取消',
            applyLabel: '确定',
            customRangeLabel: '区间',
            daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
            firstDay: 1,
            monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月',
              '十月', '十一月', '十二月']
          },
          timePicker: false,
          timePicker12Hour: false,
          timePickerIncrement: 1,
          singleDatePicker: true,
          format: 'YYYY/MM/DD HH:mm'
        }
      };

      $scope.goBack = function () {
        $state.go('goods_manager');
      };

      BedService.getBuildings(function (err, data) {
        if (data && data.buildings) {
          $scope.filter.buildings = [];
          data.buildings.forEach(function (building) {
            $scope.filter.buildings.push({id: building._id, text: building.name});
          });

          $scope.filter.currentBuilding = $scope.filter.buildings[0];
          $scope.changeBuilding();
        }
      });
    }]);
