/**
 * Created by louisha on 15/10/13.
 */

'use strict';
angular.module('EClientWeb').directive('eHeader', [
    '$state', '$location', 'Auth', '$rootScope', 'GlobalEvent',
    function ($state, $location, Auth, $rootScope, GlobalEvent) {
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
                        state: '/',
                        show: true
                    },
                    {
                        label: '自由餐',
                        state: 'free_meal',
                        title: '自由餐',
                        show: false
                    },
                    {
                        label: '购物车',
                        state: 'my_cart',
                        showTips: true,
                        tipsNum: 0,
                        show: true
                    },
                    {
                        label: '营养餐',
                        state: 'healthy_meal',
                        title: '营养餐',
                        show: false
                    },
                    {
                        label: '我的订单',
                        state: 'my_orders',
                        show: true
                    }
                ];
                scope.pageConfig = {
                    isShowSignIn: true,
                    clientInfo: null
                };

                scope.setTitle = function(title){
                    scope.currentTitle = title;
                };

                scope.goState = function (stateName) {
                    $state.current.name = stateName;
                    scope.navState = stateName;
                    $state.go(stateName);
                };

                scope.changeAccount = function(){
                    Auth.signOut();
                    if(scope.pageConfig.clientInfo.role !== 'normal'){
                        $state.go('sign_in');
                    }else{
                        $state.go('personal_sign_in');
                    }
                };

                function init() {
                    scope.navState = $state.current.name ? $state.current.name : '/';
                    scope.pageConfig.clientInfo =  Auth.getUser();
                    if(scope.pageConfig.clientInfo){
                        scope.navList[2].tipsNum = scope.pageConfig.clientInfo.cart ? scope.pageConfig.clientInfo.cart.total_count : 0;

                        scope.navList[0].show = false;
                        scope.navList[1].show = false;
                        scope.navList[2].show = false;
                        scope.navList[3].show = false;
                        scope.navList[4].show = false;
                        // if(scope.pageConfig.clientInfo.role !== 'normal'){
                        //     scope.navList[1].show = true;
                        //     scope.navList[3].show = true;
                        // }else{
                        //     scope.navList[1].show = false;
                        //     scope.navList[3].show = false;
                        // }
                    }
                }

                $rootScope.$on(GlobalEvent.onCartCountChange, function (event, newClient, callback) {
                    Auth.setUser(newClient);
                    scope.pageConfig.clientInfo =  newClient;
                    if(scope.pageConfig.clientInfo){
                        scope.navList[2].tipsNum = scope.pageConfig.clientInfo.cart ? scope.pageConfig.clientInfo.cart.total_count : 0;

                        if(scope.pageConfig.clientInfo.role !== 'normal'){
                            scope.navList[1].show = true;
                            scope.navList[3].show = true;
                        }else{
                            scope.navList[1].show = false;
                            scope.navList[3].show = false;
                        }
                    }
                });

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
