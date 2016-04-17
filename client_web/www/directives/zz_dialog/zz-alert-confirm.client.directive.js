'use strict';

angular.module('EClientWeb').directive('zzAlertConfirmDialog', function () {
    return {
        restrict: 'A',
        template: '<div class="mask" ng-show="pageConfig.show">' +
        '<div class="zz-alert">' +
        '<div class="zz-alert-title"> <span>{{pageConfig.title}}</span></div>' +
        '<div class="zz-alert-content"> <span>{{pageConfig.content}}</span></div>' +
        '<div class="row zz-alert-confirm-handle">' +
        '<div class="col-xs-6">' +
        '<div class="zz-btn-primary zz-alert-btn" ng-click="sure()">{{pageConfig.sure}}</div>' +
        '</div>' +
        '<div class="col-xs-6">' +
        '<div class="zz-btn-primary zz-alert-btn" ng-click="cancel()">{{pageConfig.cancel}}</div> ' +
        '</div> </div> </div></div>',
        replace: true,
        scope: {
            pageConfig: '='
        },
        link: function (scope, element, attributes) {
            if (!scope.pageConfig) {
                scope.pageConfig = {
                    show: false,
                    title: '消息',
                    content: '',
                    cancel: '取消',
                    sure: '确认',
                    callback: null
                };
            }
            scope.cancel = function () {
                scope.pageConfig.show = false;
                scope.pageConfig.content = '';
            };

            scope.sure = function () {
                scope.cancel();
                if (scope.pageConfig.callback) {
                    scope.pageConfig.callback();
                }
            };
            scope.$watch('show', function (newVal, oldVal) {
                scope.initShow();
            });
            scope.initShow = function () {
                console.log(scope.pageConfig.content);
            };

        }

    };
});
