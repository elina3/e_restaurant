'use strict';
angular.module('EWeb').controller('SupermarketOrderController',
  ['$scope', '$window', '$stateParams', '$rootScope', 'GlobalEvent', '$state', 'QiNiuService', 'Config', 'SupermarketOrderService', 'Auth',
    function ($scope, $window, $stateParams, $rootScope, GlobalEvent, $state, QiNiuService, Config, SupermarketOrderService, Auth) {

      var user = Auth.getUser();
      $scope.isShowBack = user.role === 'cooker' || user.role === 'delivery' ? false : true;
      $scope.supermarket_orders = [];
      $scope.currentStatus = {id: '', text: '所有状态'};
      $scope.orderTypes = [
        {id: '', text: '所有类型'},
        {id: true, text: '折扣订单'},
        {id: false, text: '普通订单'}
      ];

      $scope.statistic = {
        totalAmount: 0,
        totalActualAmount: 0
      };

      $scope.filter = {
        card_number: '',
        start_time: '',
        card_id_number: '',
        client_username: '',
        order_type: {id: '', text: '所有类型'}
      };

      $scope.pagination = {
        currentPage: 1,
        limit: 10,
        totalCount: 0,
        skipCount: 0,
        onCurrentPageChanged: function (callback) {
          loadSupermarketOrders();
        }
      };
      function loadSupermarketOrders() {
        var filter = {
          status: $scope.currentStatus.id,
          card_number: $scope.filter.card_number,
          card_id_number: $scope.filter.card_id_number,
          client_username: $scope.filter.client_username
        };

        var timeRange = {};
        if($scope.pageShow.createTimeRange){
          if($scope.pageShow.createTimeRange.startDate && $scope.pageShow.createTimeRange.startDate._d){
            timeRange.startTime = moment($scope.pageShow.createTimeRange.startDate).toISOString();
          }
          if($scope.pageShow.createTimeRange.endDate && $scope.pageShow.createTimeRange.endDate._d){
            timeRange.endTime = moment($scope.pageShow.createTimeRange.endDate).toISOString();
          }
        }
        var timeRangeString = JSON.stringify(timeRange);

        if($scope.filter.order_type &&  $scope.filter.order_type.id !== ''){
          filter.has_discount = $scope.filter.order_type.id;
        }
        $scope.$emit(GlobalEvent.onShowLoading, true);
        SupermarketOrderService.getSupermarketOrders($scope.pagination, filter, timeRangeString, function (err, data) {
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if(err || !data.orders){
            $scope.$emit(GlobalEvent.onShowAlert, err);
          }
          $scope.supermarket_orders = $scope.supermarket_orders.concat(data.supermarket_orders);
          $scope.pagination.skipCount += data.supermarket_orders.length;

          $scope.pagination.totalCount = data.total_count;
          $scope.pagination.limit = data.limit;
          $scope.pagination.pageCount = Math.ceil($scope.pagination.totalCount / $scope.pagination.limit);
        });
      }

      $scope.search = function () {
        $scope.pagination.currentPage = 1;
        $scope.pagination.skipCount = 0;
        $scope.pagination.totalCount = 0;
        $scope.pagination.pageCount = 0;
        $scope.supermarket_orders = [];
        loadSupermarketOrders();
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

      $scope.goBack = function () {
        $state.go('user_index');
      };

      function generateUrl(src) {
        return Config.qiniuServerAddress + src;
      }

      $scope.generateStyle = function (src) {
        if (!src) {
          return;
        }
        return {
          'background': 'url(' + generateUrl(src) + ') no-repeat center top',
          'background-size': 'cover'
        };
      };

      $scope.goOrderStatistic = function(){
        $state.go('supermarket_statistic');
      };

      $scope.loadMore = function () {
        loadSupermarketOrders();
      };

      function init() {
        loadSupermarketOrders();
      }

      init();
    }]);