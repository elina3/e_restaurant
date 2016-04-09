/**
 * Created by elinaguo on 15/9/24.
 */
'use strict';
angular.module('EClientWeb').controller('IndexController',
    [
        '$rootScope',
        '$scope',
      '$state',
        function ($rootScope,
                  $scope,
                  $state) {

            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                $rootScope.location = toState.name;
            });

            $scope.goToView = function(viewPage){
                switch(viewPage){
                    case 'goodsDetail':
                        $state.go('goods_detail');
                        break;
                    case 'freeMeal':
                        $state.go('free_meal');
                        break;
                    case 'goodsCart':
                        $state.go('my_cart');
                        break;
                    case 'myOrders':
                        $state.go('my_orders');
                        break;
                    case 'signIn':
                        $state.go('sign_in');
                        break;
                    case 'home':
                        $state.go('/');
                        break;
                }
            };
        }]);
