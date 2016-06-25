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
        isShow: false,
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
        currentIdNumber: ''
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

      $scope.panelBuildingChange = function(){
        if ($scope.panelConfig.newSicker.building) {
          getFloorsByBuilding($scope.panelConfig.newSicker.building, function(err, floors){
            if(!err){
              $scope.panelConfig.floors = floors;
            }
          });
        }
      };
      $scope.panelFloorChange = function(){
        if ($scope.panelConfig.newSicker.floor) {
          getBedsByFloor($scope.panelConfig.newSicker.floor, function(err, beds){
            if(!err){
              $scope.panelConfig.beds = beds;
            }
          });
        }
      };

      $scope.search = function () {
        alert('hhh');
      };
      $scope.save = function(){
        alert('save');
      };
      $scope.leaveHospital =function(){
        alert('leave');
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
            };
          });
          $scope.panelConfig.buildings = buildings;

          defaultBuilding = buildings[0];
          $scope.panelConfig.newSicker.building = defaultBuilding;
          $scope.panelBuildingChange();
        }
      });
    }]);
