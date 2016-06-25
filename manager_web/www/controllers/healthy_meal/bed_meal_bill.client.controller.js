/**
 * Created by elinaguo on 16/6/26.
 */

'use strict';
angular.module('EWeb').controller('BedMealBillController',
  ['$scope', '$window', '$stateParams', '$rootScope', 'GlobalEvent', '$state', 'Auth', 'BedService', 'BedMealRecordService',
    function ($scope, $window, $stateParams, $rootScope, GlobalEvent, $state, Auth, BedService, BedMealRecordService) {
      $scope.pageData = {
        mealTags: [{id: '', text: '所有就餐类型'}, {id: 'breakfast', text: '早餐'}, {id: 'lunch', text: '午餐'}, {id: 'dinner', text: '晚餐'}],
        pagination: {
          currentPage: 1,
          limit: 10,
          skipCount: 0
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
            timePickerIncrement: 1,
            separator: ' ~ ',
            format: 'YY/MM/DD HH:mm'
          }
        }
      };

      $scope.filter = {
        currentIdNumber: '',
        currentMealTag: null
      };

      $scope.goBack = function () {
        $state.go('goods_manager');
      };
    }]);
