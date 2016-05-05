/**
 * Created by elinaguo on 16/5/2.
 */
'use strict';
angular.module('EWeb').controller('GoodsOrderController',
  ['$scope', '$window', '$stateParams', '$rootScope', 'GlobalEvent', '$state', 'QiNiuService', 'Config', 'OrderService', 'Auth',
    function ($scope, $window, $stateParams, $rootScope, GlobalEvent, $state, QiNiuService, Config, OrderService, Auth) {

      var user = Auth.getUser();
      $scope.isShowBack = user.role === 'cooker' || user.role === 'delivery' ? false : true;
      $scope.orders = [];
      $scope.currentStatus = {id: '', text: '所有状态'};
      $scope.statuses = [
        {id: '', text: '所有状态'},
        {id: 'unpaid', text: '未支付'},
        {id: 'paid', text: '已支付'},
        {id: 'cooking', text: '烹饪中'},
        {id: 'transporting', text: '配送中'},
        {id: 'complete', text: '已完成'}];
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

      function loadOrders() {
        var filter = {
          status: $scope.currentStatus.id,
          card_number: $scope.filter.card_number,
          card_id_number: $scope.filter.card_id_number,
          client_username: $scope.filter.client_username,
          start_time_stamp: -1,
          end_time_stamp: -1
        };

        if($scope.pageShow.createTimeRange){
          if($scope.pageShow.createTimeRange.startDate && $scope.pageShow.createTimeRange.startDate._d){
            filter.start_time_stamp = $scope.pageShow.createTimeRange.startDate._d.getTime();
          }
          if($scope.pageShow.createTimeRange.endDate && $scope.pageShow.createTimeRange.endDate._d){
            filter.end_time_stamp = $scope.pageShow.createTimeRange.endDate._d.getTime();
          }
        }

        if($scope.filter.order_type &&  $scope.filter.order_type.id !== ''){
          filter.has_discount = $scope.filter.order_type.id;
        }
        OrderService.getOrders($scope.pagination, filter, function (err, data) {
          console.log(data);
          $scope.orders = data.orders;
          $scope.pagination.skipCount += data.orders.length;

          $scope.pagination.totalCount = data.total_count;
          $scope.pagination.limit = data.limit;
          $scope.pagination.pageCount = Math.ceil($scope.pagination.totalCount / $scope.pagination.limit);
          $scope.statistic = data.statistics;
        });
      }

      $scope.search = function () {
        $scope.pagination.currentPage = 1;
        $scope.pagination.skipCount = 0;
        $scope.pagination.totalCount = 0;
        $scope.pagination.pageCount = 0;
        loadOrders();
      };

      $scope.pagination = {
        currentPage: 1,
        limit: 10,
        totalCount: 0,
        skipCount: 0,
        onCurrentPageChanged: function (callback) {
          loadOrders();
        }
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

        $state.go('goods_manager');
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

      $scope.translateOrderStatus = function (status) {
        return OrderService.translateOrderStatus(status);
      };

      $scope.translateGoodsOrderStatus = function (status) {
        return OrderService.translateGoodsOrderStatus(status);
      };

      $scope.cook = function (order) {
        $scope.$emit(GlobalEvent.onShowLoading, true);
        OrderService.cookOrder(order._id, function (err, result) {
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err || !result.success) {
            $scope.$emit(GlobalEvent.onShowAlert, err);
          }
          $state.reload();
        });
      };

      $scope.delivery = function (order) {
        $scope.$emit(GlobalEvent.onShowLoading, true);
        OrderService.deliveryOrder(order._id, function (err, result) {
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err || !result.success) {
            $scope.$emit(GlobalEvent.onShowAlert, err);
          }
          $state.reload();
        });
      };

      $scope.complete = function (order) {
        $scope.$emit(GlobalEvent.onShowLoading, true);
        OrderService.completeOrder(order._id, function (err, result) {
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err || !result.success) {
            $scope.$emit(GlobalEvent.onShowAlert, err);
          }
          $state.reload();
        });
      };

      $scope.loadMore = function () {
        loadOrders();
      };

      function init() {
        loadOrders();
      }

      init();
    }]);