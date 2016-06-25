/**
 * Created by elinaguo on 16/6/23.
 */

'use strict';
angular.module('EWeb').controller('HospitalizedInfoController',
  ['$scope', '$window', '$stateParams', '$rootScope', 'GlobalEvent', '$state', 'Auth', 'BedService', 'BedMealRecordService',
    function ($scope, $window, $stateParams, $rootScope, GlobalEvent, $state, Auth, BedService, BedMealRecordService) {

      var defaultBuilding;
      var sexes = [{id: 'female', text: '女'}, {id: 'male', text: '男'}, {id: 'unknown', text: '未知'}];

      $scope.panelConfig = {
        isShow: true,
        buildings: [],
        floors: [],
        beds: [],
        sexes: sexes,
        newSicker: {
          building: null,
          floor: null,
          bed: null,
          id_number: '',
          nickname: '',
          sex: null,
          phone: ''
        },
        reset: function(){
          this.beds = [];
          this.newSicker.building = defaultBuilding;
          this.newSicker.floor = null;
          this.newSicker.bed = null;
          this.id_number = '';
          this.nickname = '';
          this.sex = null;
          this.phone = '';
        }
      };
      $scope.showPanel = function(){
        $scope.panelConfig.isShow = true;
        $scope.panelConfig.reset();
      };
      $scope.closePanel = function(){
        $scope.panelConfig.isShow = false;
      };

      $scope.filter = {
        currentBuilding: null,
        currentFloor: null,
        buildings: [],
        floors: [],
        beds: [],
        sexes: [{id: 'female', text: '女'}, {id: 'male', text: '男'}, {id: 'unknown', text: '未知'}]
      };

      function getFloorsByBuilding(building, callback){
        BedService.getFloorsByBuildingId(building.id, function (err, data) {
          if (data && data.floors) {
            var floors = data.floors.map(function(item){
              return {
                id: item._id,
                text: item.name
              };
            });

            return callback(null, floors);
          }
          return callback('请求数据失败，请刷新页面重试');
        });
      }
      function getBedsByFloor(floor, callback){
        BedService.getBedsByFloorId(floor.id, function (err, data) {
          if (data && data.beds) {
            var beds = data.beds.map(function (item) {
              return {
                id: item._id,
                text: item.name
              };
            });
            return callback(null, beds);
          }
          return callback('请求数据失败，请刷新页面重试');
        });
      }

      $scope.filterBuildingChange = function () {
        if ($scope.filter.currentBuilding) {
          getFloorsByBuilding($scope.filter.currentBuilding, function(err, floors){
            if(!err){
              $scope.filter.floors = floors;
            }
          });
        }
      };
      $scope.filterFloorChange = function () {
        if ($scope.filter.currentFloor) {
          getBedsByFloor($scope.filter.currentFloor, function(err, beds){
            if(!err && beds){
              $scope.beds = beds;
            }
          });
        }
      };

      $scope.panelBuildingChange = function(){
        if ($scope.pageConfig.newSicker.building) {
          getFloorsByBuilding($scope.pageConfig.newSicker.building, function(err, floors){
            if(!err){
              $scope.pageConfig.floors = floors;
            }
          });
        }
      };
      $scope.panelFloorChange = function(){
        if ($scope.pageConfig.newSicker.floor) {
          getBedsByFloor($scope.pageConfig.newSicker.floor, function(err, beds){
            if(!err){
              $scope.pageConfig.beds = beds;
            }
          });
        }
      };

      function getTimeStamp(){
        if ($scope.pageShow.createTimeRange.startDate && $scope.pageShow.createTimeRange.startDate._d) {
          var time = moment($scope.pageShow.createTimeRange.startDate);
          return new Date(time).getTime();
        }
        return;
      }
      $scope.search = function () {
        var timeStamp = getTimeStamp();
        if(!timeStamp){
          return $scope.$emit(GlobalEvent.onShowAlert, '请选择时间！');
        }
      };

      $scope.datePicker = {
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
          timePicker: true,
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
          var buildings = data.buildings.map(function(item){
            return {
              id: item._id,
              text: item.name
            }
          });
          $scope.filter.buildings = buildings;
          $scope.panelConfig.buildings = buildings;

          defaultBuilding = buildings[0];
          $scope.filter.currentBuilding = defaultBuilding;
          $scope.panelConfig.newSicker.building = defaultBuilding;
          $scope.filterBuildingChange();
          $scope.panelBuildingChange();
        }
      });
    }]);
