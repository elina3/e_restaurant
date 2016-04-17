'use strict';
angular.module('EClientWeb').directive('zzAlertDialog', function () {
    return {
        restrict: 'EA',
        template: '<div class="mask" ng-show="pageConfig.show"><div class="zz-alert">' +
        '<div class="zz-alert-title"> <span>{{pageConfig.title}}</span></div>' +
        '<div class="zz-alert-content"> <span>{{pageConfig.content}}</span></div>' +
        '<div class="zz-alert-handle">' +
        '<div class="zz-btn-primary zz-alert-btn" ng-click="closed()">{{pageConfig.okLabel}}</div>' +
        ' </div></div></div>',
        replace: true,
        scope: {
            pageConfig: '='
        },
        link: function (scope, element, attributes) {
            if (!scope.pageConfig) {
                scope.pageConfig = {
                    title: '消息',
                    content: '内容',
                    okLabel: '确定',
                    show: true,
                    callback: null
                };
            }
            scope.closed = function () {
                scope.pageConfig.show = false;
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
