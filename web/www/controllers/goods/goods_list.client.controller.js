///**
// * Created by louisha on 15/6/19.
// */
//'use strict';
//angular.module('eWeb').controller('GoodsListController',
//    ['$scope', 'GlobalEvent', '$state', 'GoodsService',
//        function ($scope, GlobalEvent, $state, GoodsService) {
//            $scope.initPage = {
//                goods_list: [],
//                goodsCategories: [],
//                search:{
//                    category: '',
//                    goodsName:''
//                },
//                pagination: {
//                    currentPage: 1,
//                    limit: 10,
//                    totalCount: 0,
//                    pageCount: 0,
//                    pageNavigationCount: 5,
//                    canSeekPage: true,
//                    limitArray: [10, 20, 30, 40, 100],
//                    pageList: [],
//                    onCurrentPageChanged: function (callback) {
//                        console.log('current page changed');
//                        getGoodsList();
//                    }
//                }
//            };
//
//            function getGoodsCategories() {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                GoodsService.getGoodsCategories().then(function (data) {
//                    console.log(data);
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    if (data.err) {
//                        $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                    }
//                    else {
//                        $scope.initPage.goodsCategories = data.categories;
//
//                    }
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            function updatePaginationConfig(totalCount, limit){
//                $scope.initPage.pagination.totalCount = totalCount;
//                $scope.initPage.pagination.limit = limit;
//                $scope.initPage.pagination.pageCount = Math.ceil(totalCount / limit);
//                $scope.initPage.pagination.render();
//            }
//
//            function getGoodsList() {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                GoodsService.getGoodsListByCondition($scope.initPage.pagination.currentPage, $scope.initPage.pagination.limit, $scope.initPage.search).then(function (data) {
//                    console.log(data);
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    if (data.err) {
//                        $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                    }
//                    else {
//                        $scope.initPage.goods_list = data.goods_list;
//                        updatePaginationConfig(data.total_count, data.limit);
//                    }
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            $scope.onSearchClick = function(){
//                getGoodsList();
//            };
//
//            $scope.getCategoryName = function (categorys) {
//                return GoodsService.getCategoryName(categorys);
//            };
//
//            $scope.addGoods = function () {
//                $state.go('goodsAdd');
//            };
//
//            $scope.onEditGoods = function (goods) {
//                $state.go('goodsAdd', {goodsId: goods._id});
//            };
//            $scope.onDeleteGoods = function (goodsId) {
//
//                $scope.$emit(GlobalEvent.onShowAlertConfirm, {info: '是否确认删除？'}, function () {
//                    $scope.$emit(GlobalEvent.onShowLoading, true);
//                    GoodsService.deleteGoods(goodsId).then(function (data) {
//                        console.log(data);
//                        $scope.$emit(GlobalEvent.onShowLoading, false);
//                        if (data.err) {
//                            $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                        }
//                        if (data.error) {
//                            $scope.$emit(GlobalEvent.onShowAlert, data.error.type);
//                        }
//                        else {
//                            $scope.$emit(GlobalEvent.onShowAlert, '删除成功');
//                            getGoodsList();
//                        }
//                    }, function (err) {
//                        console.log(err);
//                    });
//                });
//
//            };
//
//            getGoodsCategories();
//            getGoodsList();
//        }]);
