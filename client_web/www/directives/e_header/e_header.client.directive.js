/**
 * Created by louisha on 15/10/13.
 */

'use strict';
angular.module('EClientWeb').directive('eHeader', [
    '$state', '$location', 'Auth',
    function ($state, $location, Auth) {
        return {
            restrict: 'EA',
            templateUrl: 'directives/e_header/e_header.client.directive.html',
            replace: true,
            scope: {
                toggleCategory: '='
            },
            link: function (scope, element, attributes) {
                scope.searchName = '';
                scope.navList = [
                    {
                        label: '首页',
                        state: '/'
                    },
                    {
                        label: '自由餐',
                        state: 'free_meal',
                        title: '自由餐'
                    },
                    {
                        label: '购物车',
                        state: 'my_cart',
                        showTips: true,
                        tipsNum: 1
                    },
                    {
                        label: '我的订单',
                        state: 'my_orders'
                    }
                ];

                scope.setTitle = function(title){
                    scope.currentTitle = title;
                };

                scope.goState = function (stateName) {
                    $state.current.name = stateName;
                    scope.navState = stateName;
                    $state.go(stateName);
                };

                function initCarInfo() {
                    //var carNum = GoodsService.getCartGoodsNum();
                    //scope.navList[1].showTips = carNum > 0;
                    //scope.navList[1].tipsNum = carNum;
                }

                function init() {

                    scope.navState = $location;
                    scope.navState = $state.current.name;
                    scope.grocer = Auth.getUser();
                    console.log(scope.grocer);
                    initCarInfo();
                }

                //scope.$on(GlobalEvent.onChangeCarGoods, function (e) {
                //    initCarInfo();
                //});

                //scope.search = function (searchName) {
                //    if (searchName) {
                //        $state.go('searchGoodsList', {goods_name: searchName});
                //    }
                //};

                init();
            }
        };
    }]);
