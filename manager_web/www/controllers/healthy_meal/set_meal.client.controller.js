/**
 * Created by elinaguo on 16/6/12.
 */
/**
 * Created by elinaguo on 16/5/2.
 */
'use strict';
angular.module('EWeb').controller('SetMealController',
  ['$scope', '$window', '$stateParams', '$rootScope', 'GlobalEvent', '$state','Auth', 'BedService',
    function ($scope, $window, $stateParams, $rootScope, GlobalEvent, $state, Auth, BedService) {

      $scope.filter = {
        currentBuilding: null,
        currentFloor: null,
        buildings: [],
        floors: [],
        mealTypes: [{id: '', text: '普食'}, {id: '', text: '流食'}, {id: '', text: '半流食'}, {id: '', text: '软食'}]
      };
      $scope.changeBuilding = function(){
        if($scope.filter.currentBuilding){
          BedService.getFloorsByBuildingId($scope.filter.currentBuilding.id, function(err, data){
            if(data && data.floors){
              $scope.filter.floors = [];

              data.floors.forEach(function(floor){
                $scope.filter.floors.push({
                  id: floor._id,
                  text: floor.name
                });
              });
            }
          });
        }
      };

      $scope.changeFloor = function(){
        if($scope.filter.currentFloor){
          BedService.getBedsByFloorId($scope.filter.currentFloor.id, function(err, data){
            if(data && data.beds){
              $scope.beds = [];

              //todo load set info

              data.beds.forEach(function(bed){
                $scope.beds.push({
                  name: bed.name,
                  breakfast: null,
                  lunch: null,
                  dinner: null
                });
              });
            }
          });
        }
      };



      $scope.beds = [];
      $scope.search = function () {
        $scope.pagination.currentPage = 1;
        $scope.pagination.skipCount = 0;
        $scope.pagination.totalCount = 0;
        $scope.pagination.pageCount = 0;
        $scope.orders = [];
      };
      $scope.applyYesterday = function(){

      };
      $scope.saveMealSet = function(){};

      $scope.pageShow = {
        createTimeRange: '',
        createTimeMinTime: moment().format('YY/MM/DD HH:mm'),
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
          timePicker: true,
          timePicker12Hour: false,
          timePickerIncrement: 1,
          separator: ' ~ ',
          format: 'YY/MM/DD HH:mm'
        }
      };

      $scope.goBack = function () {
        $state.go('goods_manager');
      };

      BedService.getBuildings(function(err, data){
        if(data && data.buildings){
          $scope.filter.buildings = [];
          data.buildings.forEach(function(building){
            $scope.filter.buildings.push({id: building._id, text: building.name});
          });
        }

      });
    }]);
