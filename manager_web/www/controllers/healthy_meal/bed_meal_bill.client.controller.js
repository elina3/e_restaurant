/**
 * Created by elinaguo on 16/6/26.
 */

'use strict';
angular.module('EWeb').controller('BedMealBillController',
  ['$scope', '$window', '$stateParams', '$rootScope', 'GlobalEvent', '$state', 'Auth', 'BedService', 'BedMealRecordService', 'BedMealBillService', 'GoodsService',
    function ($scope, $window, $stateParams, $rootScope, GlobalEvent, $state, Auth, BedService, BedMealRecordService, BedMealBillService, GoodsService) {

      $scope.pageData = {
        mealTags: [{id: '', text: '所有类型'},
          {id: 'breakfast', text: '早餐'},
          {id: 'lunch', text: '午餐'},
          {id: 'dinner', text: '晚餐'}],
        mealTypes: [{id: '', text: '所有种类'},
          {id: 'healthy_normal', text: '普食'},
          {id: 'liquid_diets', text: '流质饮食'},
          {id: 'semi_liquid_diets', text: '半流质饮食'},
          {id: 'diabetic_diets', text: '糖尿病饮食'},
          {id: 'low_fat_low_salt_diets', text: '低脂低盐饮食'}],
        pagination: {
          currentPage: 1,
          limit: 20,
          totalCount: 0,
          skipCount: 0,
          onCurrentPageChanged: function (callback) {
            loadBills();
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
            timePicker: false,
            timePicker12Hour: false,
            timePickerIncrement: 0,
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
            timeRange.startTime = moment($scope.pageData.datePicker.startDate).toISOString();
          }
          if ($scope.pageData.datePicker.createTimeRange.endDate && $scope.pageData.datePicker.createTimeRange.endDate._d) {
            timeRange.endTime = moment($scope.pageData.datePicker.createTimeRange.endDate).toISOString();
          }
        }
        return JSON.stringify(timeRange);
      }

      function loadBills() {
        BedMealBillService.queryBedMealBillsByFilter({
          idNumber: $scope.filter.currentIdNumber,
          mealType: $scope.filter.currentMealType ? $scope.filter.currentMealType.id : '',
          mealTag: $scope.filter.currentMealTag ? $scope.filter.currentMealTag.id : '',
          timeRangeString: getTimeRangeString(),
          currentPage: $scope.pageData.pagination.currentPage,
          limit: $scope.pageData.pagination.limit,
          skipCount: $scope.pageData.pagination.skipCount
        }, function (err, data) {
          if (err || !data) {
            return $scope.$emit(GlobalEvent.onShowAlert, err || '查询失败');
          }

          if (data.bed_meal_bills) {
            $scope.pageData.bills = data.bed_meal_bills.map(function (item) {
              return {
                building: item.building,
                floor: item.floor,
                bed: item.bed,
                meal_set_date: item.meal_set_date,
                meal_tag: item.meal_tag,
                meal_type: item.meal_type,
                id_number: item.id_number,
                nickname: item.nickname,
                goods_bills: item.goods_bills,
                amount_paid: item.amount_paid,
                is_checkout: item.is_checkout
              };
            });
          }


          $scope.pageData.pagination.totalCount = data.total_count;
          $scope.pageData.pagination.limit = data.limit;
          $scope.pageData.pagination.pageCount = Math.ceil($scope.pageData.pagination.totalCount / $scope.pageData.pagination.limit);

        });
      }

      function loadAmountStatistic(){
        BedMealBillService.queryBedMealBillStatistic({
          idNumber: $scope.filter.currentIdNumber,
          mealType: $scope.filter.currentMealType ? $scope.filter.currentMealType.id : '',
          mealTag: $scope.filter.currentMealTag ? $scope.filter.currentMealTag.id : '',
          timeRangeString: getTimeRangeString()
        }, function (err, data) {
          if (err || !data) {
            return $scope.$emit(GlobalEvent.onShowAlert, err || '查询失败');
          }

          $scope.pageData.totalAmount = data.totalAmount !== 0 ? (data.totalAmount /100).toFixed(3) : '--';
        });
      }

      $scope.filter = {
        currentIdNumber: '',
        currentMealTag: null,
        currentMealType: null,
        search: function () {
          $scope.pageData.pagination.currentPage = 1;
          $scope.pageData.pagination.skipCount = 0;

          if (!$scope.pageData.datePicker.createTimeRange) {
            return $scope.$emit(GlobalEvent.onShowAlert, '请选择时间');
          }

          loadBills();
          loadAmountStatistic();
        }
      };

      $scope.translateMealType = function (bill) {
        return BedMealBillService.translateMealType(bill);
      };
      $scope.translateMealTag = function (mealTag) {
        return BedMealBillService.translateMealTag(mealTag);
      };

      $scope.goBack = function () {
        $window.history.back();
      };
    }]);
