/**
 * Created by louisha on 15/10/13.
 */

'use strict';
angular.module('EClientWeb').directive('eHeadNav', [
    '$state', 'Auth', '$window',
    function ($state, Auth, $window) {
        return {
            restrict: 'EA',
            templateUrl: 'directives/e_head_nav/e_head_nav.client.directive.html',
            replace: true,
            scope: {
                config: '='
            },
            link: function (scope, element, attributes) {
                if(!scope.config){
                    scope.config = {};
                }

                if(scope.config.backShow === undefined || scope.config.backShow === null){
                    scope.config.backShow = true;
                }

                scope.goBack = function(view){
                    if(scope.config && scope.config.backView){
                        $state.go(view);
                        return;
                    }

                    $window.history.back();
                };
            }
        };
    }]);
