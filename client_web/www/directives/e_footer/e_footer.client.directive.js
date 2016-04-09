/**
 * Created by louisha on 15/10/13.
 */

'use strict';
angular.module('EClientWeb').directive('eFooter', [
    '$state', 'Auth',
    function ($state, Auth) {
        return {
            restrict: 'EA',
            templateUrl: 'directives/e_footer/e_footer.client.directive.html',
            replace: true,
            scope: {
                toggleCategory: '='
            },
            link: function (scope, element, attributes) {
                scope.searchName = '';
                scope.shoppingCar = {};


                function initCarInfo() {
                    //var carNum = GoodsService.getCartGoodsNum();

                    scope.shoppingCar.count = 1;
                }

                scope.goState = function (stateName) {
                    scope.navState = stateName;
                    $state.go(stateName);
                };

                function init() {
                    scope.navState = '/';
                    scope.grocer = Auth.getUser();
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