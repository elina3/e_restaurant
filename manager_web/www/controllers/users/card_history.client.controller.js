/**
 * Created by elinaguo on 16/4/24.
 */

'use strict';
angular.module('EWeb').controller('CardHistoryController',
  ['$rootScope', '$scope', 'GlobalEvent', '$state', 'CardHistoryService', 'Config', '$window',
    function ($rootScope, $scope, GlobalEvent, $state, CardHistoryService, Config, $window) {

      $scope.pageData = {
        keyword: '',
        pagination: {
          currentPage: 1,
          limit: 10,
          totalCount: 0,
          isShowTotalInfo: true,
          onCurrentPageChanged: function (callback) {
            loadCardHistories();
          }
        },
        cardHistories: []
      };

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


      $scope.searchKey = function(){
        loadCardHistories();
      };
      $scope.goBack = function () {
        $window.history.back();
      };


      function loadCardHistories(){
        $scope.$emit(GlobalEvent.onShowLoading, true);
        CardHistoryService.getCardHistories($scope.pageData.pagination,
          $scope.pageData.keyword,function(err, data){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if(err || !data){
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          $scope.pageData.cardHistories = data.card_history_list;
          $scope.pageData.pagination.totalCount = data.total_count;
          $scope.pageData.pagination.limit = data.limit;
          $scope.pageData.pagination.pageCount = Math.ceil($scope.pageData.pagination.totalCount / $scope.pageData.pagination.limit);
        });
      }

      function init(){
        loadCardHistories();
      }
      init();
    }]);
