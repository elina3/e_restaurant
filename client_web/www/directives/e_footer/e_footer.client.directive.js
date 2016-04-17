/**
 * Created by louisha on 15/10/13.
 */

'use strict';
angular.module('EClientWeb').directive('eFooter', [
    '$state', 'Auth', '$rootScope', 'GlobalEvent',
    function ($state, Auth, $rootScope, GlobalEvent) {
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

                scope.goState = function (stateName) {
                    scope.navState = stateName;
                    $state.go(stateName);
                };

                function init() {
                    scope.navState = $state.current.name;
                    var client =  Auth.getUser();
                    if(client){
                        scope.shoppingCar.count = client.cart ? client.cart.total_count : 0;
                    }
                }


                $rootScope.$on(GlobalEvent.onCartCountChange, function (event, newClient, callback) {
                    Auth.setUser(newClient);
                    scope.shoppingCar.count = newClient.cart ? newClient.cart.total_count : 0;
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
