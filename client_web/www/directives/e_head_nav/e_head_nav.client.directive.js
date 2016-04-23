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

                if(scope.config.backShow === '' || scope.config.backShow === undefined || scope.config.backShow === null){
                    scope.config.backShow = true;
                }

                scope.changeAccount = function(){
                    Auth.signOut();
                    $state.go('sign_in');
                };

                scope.goBack = function(){
                    if(scope.config && scope.config.backView){
                        $state.go(scope.config.backView);
                        return;
                    }

                    $window.history.back();
                };

                function init() {
                    scope.config.clientInfo =  Auth.getUser();
                }
                init();
            }
        };
    }]);
