///**
// * Created by louisha on 15/7/8.
// */
//'use strict';
//angular.module('eWeb').controller('OrderListController',
//    ['$rootScope', '$scope', 'GlobalEvent', 'OrderService', 'Global',
//        function ($rootScope, $scope, GlobalEvent, OrderService, Global) {
//
//            $scope.initPage = {
//                orderList: [],
//                pagination: {
//                    currentPage: 1,
//                    limit: 10,
//                    totalCount: 0,
//                    pageCount: 0,
//                    pageNavigationCount: 5,
//                    canSeekPage: false,
//                    limitArray: [10, 20, 30, 40, 100],
//                    pageList: [],
//                    onCurrentPageChanged: function () {
//                        console.log('current page changed');
//                        getOrderList();
//                    }
//                }
//            };
//
//
//            function updatePaginationConfig(totalCount, limit){
//                $scope.initPage.pagination.totalCount = totalCount;
//                $scope.initPage.pagination.limit = limit;
//                $scope.initPage.pagination.pageCount = Math.ceil(totalCount / limit);
//                $scope.initPage.pagination.render();
//            }
//
//            function getOrderList() {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                OrderService.getGrocerOrderList($scope.initPage.pagination.currentPage, $scope.initPage.pagination.limit, $scope.initPage.searchKey).then(function (data) {
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    console.log(data);
//                    if (data.err) {
//                        $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                    }
//                    else {
//                        $scope.initPage.orderList = data.grocer_orders;
//                        updatePaginationConfig(data.total_count, data.limit);
//                    }
//
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            getOrderList();
//        }]);
