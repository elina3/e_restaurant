///**
// * Created by louisha on 15/6/19.
// */
//'use strict';
//angular.module('eWeb').controller('GoodsTemplateListController',
//    ['$scope', 'GlobalEvent', '$state', 'GoodsService',
//        function ($scope, GlobalEvent, $state, GoodsService) {
//            $scope.initPage = {
//                goods_list: [],
//                goodsCategories: [],
//                search: {
//                    category: '',
//                    goodsName: ''
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
//
//            function updatePaginationConfig(totalCount, limit) {
//                $scope.initPage.pagination.totalCount = totalCount;
//                $scope.initPage.pagination.limit = limit;
//                $scope.initPage.pagination.pageCount = Math.ceil(totalCount / limit);
//                $scope.initPage.pagination.render();
//            }
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
//                        getGoodsList();
//
//                    }
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            function getGoodsList() {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                GoodsService.getGoodsTemplateList({
//                    goods_name: $scope.initPage.search.goodsName,
//                    category: $scope.initPage.search.category,
//                    current_page: $scope.initPage.pagination.currentPage,
//                    limit: $scope.initPage.pagination.limit
//                }, function (err, data) {
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    if (err) {
//                        return $scope.$emit(GlobalEvent.onShowAlert, err.type);
//                    }
//                    $scope.initPage.goods_list = data.goods_template_info_list;
//                    updatePaginationConfig(data.total_count, data.limit);
//                });
//            }
//
//
//            $scope.onSearchClick = function () {
//                getGoodsList();
//            };
//
//            $scope.getCategoryNameById = function (categoryId) {
//                for (var i = 0; i < $scope.initPage.goodsCategories.length; i++) {
//                    if ($scope.initPage.goodsCategories[i]._id === categoryId) {
//                        return $scope.initPage.goodsCategories[i].name;
//                    }
//                }
//                return '';
//            };
//
//            $scope.addGoodsTemplate = function () {
//                $state.go('goodsTemplate');
//            };
//
//
//            $scope.onEditGoods = function (goods) {
//                $state.go('goodsTemplate', {goodsId: goods._id});
//            };
//
//            $scope.onDeleteGoods = function (goodsId) {
//
//                $scope.$emit(GlobalEvent.onShowAlertConfirm, {info: '是否确认删除该商品模板？'}, function () {
//                    $scope.$emit(GlobalEvent.onShowLoading, true);
//                    GoodsService.goodsTemplateDelete(goodsId, function (err, data) {
//                        $scope.$emit(GlobalEvent.onShowLoading, false);
//                        if (err) {
//                            return $scope.$emit(GlobalEvent.onShowAlert, err.type);
//                        }
//                        $scope.$emit(GlobalEvent.onShowAlert, '删除成功');
//                        getGoodsList();
//                    });
//
//                });
//            };
//            getGoodsCategories();
//        }]);
