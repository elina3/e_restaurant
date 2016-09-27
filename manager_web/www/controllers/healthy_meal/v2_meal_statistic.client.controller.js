/**
 * Created by elinaguo on 16/9/17.
 */
'use strict';
angular.module('EWeb').controller('MealStatisticController',
  ['$scope', '$window', '$stateParams', '$rootScope', 'GlobalEvent', '$state', 'Auth', 'BedMealRecordService', 'MealRecordService', 'GoodsService', 'MealTypeService', 'BedService',
    function ($scope, $window, $stateParams, $rootScope, GlobalEvent, $state, Auth, BedMealRecordService, MealRecordService, GoodsService, MealTypeService, BedService) {


      var defaultMealType = {id: '', text: '所有类型'};
      var mealTypes = [defaultMealType];
      $scope.pageData = {
        mealTags: [{id: '', text: '所有类型'},
          {id: 'breakfast', text: '早餐'},
          {id: 'lunch', text: '午餐'},
          {id: 'dinner', text: '晚餐'}],
        mealTypes: mealTypes,
        billStatuses: [{id: '', text: '所有类型'}, {id: 'un_paid', text: '未付款'}, {
          id: 'paid',
          text: '已付款'
        }, {id: 'prepare_to_pay', text: '未出账单'}, {id: 'canceled', text: '已取消'}],
        pagination: {
          currentPage: 1,
          limit: 10,
          totalCount: 0,
          skipCount: 0,
          onCurrentPageChanged: function (callback) {
            loadStatistics();
          }
        },
        datePicker: {
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
        },
        bills: [],
        totalAmount: 0
      };

      function getTimeRangeString() {
        var timeRange = {};
        if ($scope.pageData.datePicker.createTimeRange) {
          if ($scope.pageData.datePicker.createTimeRange.startDate && $scope.pageData.datePicker.createTimeRange.startDate._d) {
            timeRange.startTime = moment($scope.pageData.datePicker.createTimeRange.startDate).toISOString();
          }
          if ($scope.pageData.datePicker.createTimeRange.endDate && $scope.pageData.datePicker.createTimeRange.endDate._d) {
            timeRange.endTime = moment($scope.pageData.datePicker.createTimeRange.endDate).toISOString();
          }
        }
        return JSON.stringify(timeRange);
      }

      function loadStatistics() {
        MealRecordService.getMealStatistics({
          building_id: $scope.filter.currentBuilding ? $scope.filter.currentBuilding.id : '',
          floor_id: $scope.filter.currentFloor ? $scope.filter.currentFloor.id : '',
          id_number: $scope.filter.currentIdNumber,
          time_range: getTimeRangeString(),
          current_page: $scope.pageData.pagination.currentPage,
          limit: $scope.pageData.pagination.limit,
          skip_count: $scope.pageData.pagination.skipCount
        }, function (err, data) {
          if (err || !data || !data.meal_statistics) {
            return $scope.$emit(GlobalEvent.onShowAlert, err || '查询失败');
          }

          $scope.pageData.bills = data.meal_statistics.map(function (item) {
            return {
              _id: item._id,
              bed_info: item.bed_info,
              meal_set_date: item.meal_set_date,
              id_number: item.id_number,
              nickname: item.nickname,
              leave_hospital_time: item.leave_hospital_time,
              is_leave_hospital: item.is_leave_hospital,
              is_hospitalized: item.is_hospitalized,
              hospitalized_time: item.hospitalized_time,
              day_count: item.day_count,
              meal_day_count: item.meal_day_count
            };
          });

          $scope.pageData.totalDay = data.total_day;
          $scope.pageData.mealDayCount = data.meal_day_count;
          $scope.pageData.pagination.totalCount = data.total_count;
          $scope.pageData.pagination.limit = data.limit;
          $scope.pageData.pagination.pageCount = Math.ceil($scope.pageData.pagination.totalCount / $scope.pageData.pagination.limit);

        });
      }

      $scope.filter = {
        buildings: [],
        floors: [],
        currentBuilding: null,
        currentFloor: null,
        currentIdNumber: '',
        search: function () {
          $scope.pageData.pagination.currentPage = 1;
          $scope.pageData.pagination.skipCount = 0;

          if (!$scope.pageData.datePicker.createTimeRange) {
            return $scope.$emit(GlobalEvent.onShowAlert, '请选择时间');
          }

          loadStatistics();
        },
        changeBuilding: function () {
          if (this.currentBuilding) {
            var that = this;
            BedService.getFloorsByBuildingId(that.currentBuilding.id, function (err, data) {
              if (data && data.floors) {
                that.floors = [];

                that.floors.push({id: '', text: '所有楼层'});
                data.floors.forEach(function (floor) {
                  that.floors.push({
                    id: floor._id,
                    text: floor.name
                  });
                });
              }
            });
          }
        }
      };

      $scope.user = Auth.getUser();
      $scope.goBack = function () {
        $window.history.back();
      };

      function loadBuildings() {
        BedService.getBuildings(function (err, data) {
          if (data && data.buildings) {
            $scope.filter.buildings = [];
            $scope.filter.buildings = data.buildings.map(function (building) {
              return {
                id: building._id, text: building.name
              };
            });
            $scope.filter.currentBuilding = $scope.filter.buildings[0];
            $scope.filter.changeBuilding();
          }
        });
      }

      function init() {
        loadBuildings();
      }

      init();
    }]);
