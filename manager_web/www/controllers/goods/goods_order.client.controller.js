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
        {id: '', text: '所有'},
        {id: 'discount_order', text: '折扣订单'},
        {id: 'normal_order', text: '普通订单'}
      ];

      $scope.filter = {
        card_number: '',
        start_time: '',
        card_id_number: '',
        create_username: '',
        order_type: null
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


      $scope.search = function () {
        $scope.pagination.currentPage = 1;
        $scope.pagination.skipCount = 0;
        $scope.pagination.totalCount = 0;

        if ($stateParams.filter && $stateParams.filter.status === $scope.currentStatus.id) {
          loadOrders();
        } else {
          $state.go('goods_order', {
            filter: JSON.stringify({
              status: $scope.currentStatus.id,
              card_number: $scope.filter.card_number,
              start_time: $scope.filter.start_time,
              card_id_number: $scope.filter.card_id_number,
              create_username: $scope.filter.create_username,
              order_type: $scope.filter.id
            })
          });
        }
      };

      function getStatusIndex(statusId) {
        for (var i = 0; i < $scope.statuses.length; i++) {
          if ($scope.statuses[i].id === statusId) {
            return i;
          }
        }
        return -1;
      }
      function getOrderTypeIndex(orderTypeId) {
        for (var i = 0; i < $scope.orderTypes.length; i++) {
          if ($scope.orderTypes[i].id === orderTypeId) {
            return i;
          }
        }
        return -1;
      }

      function loadOrders() {
        var currentFilter = $stateParams.filter;
        if (currentFilter) {
          currentFilter = JSON.parse(currentFilter);
          var statusIndex = getStatusIndex(currentFilter.status);
          if (statusIndex > -1) {
            $scope.currentStatus = $scope.statuses[statusIndex];
          }

          var orderTypeIndex = getOrderTypeIndex(currentFilter.order_type);
          if(orderTypeIndex > -1){
            $scope.filter.order_type = $scope.orderTypes[orderTypeIndex];
          }

          $scope.filter.card_number = currentFilter.card_number;
          $scope.filter.start_time = currentFilter.start_time;
          $scope.filter.card_id_number = currentFilter.card_id_number;
          $scope.filter.create_username = currentFilter.create_username;
        }

        OrderService.getOrders($scope.pagination, $scope.currentStatus.id, function (err, data) {
          console.log(data);
          $scope.orders = data.orders;
          $scope.pagination.skipCount += data.orders.length;

          $scope.pagination.totalCount = data.total_count;
          $scope.pagination.limit = data.limit;
          $scope.pagination.pageCount = Math.ceil($scope.pagination.totalCount / $scope.pagination.limit);
        });
      }

      function init() {
        loadOrders();
      }

      init();
    }]);