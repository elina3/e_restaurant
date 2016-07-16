/**
 * Created by louisha on 16/01/26.
 *
 * option{
 *    text:'显示信息'
 *    separator:'是否是分隔标签'
 *    其他字段任意
 * }
 */

'use strict';

angular.module('EWeb').directive('zDropdown',
    ['$timeout', 'GlobalEvent',
        function ($timeout, GlobalEvent) {
            return {
                restrict: 'EA',
                templateUrl: 'directives/z_dropdown/z_dropdown.client.directive.html',
                replace: true,
                scope: {
                    zDropdownOptions: '=', //下拉框内容
                    zDropdownModel: '=', //model
                    zDropdownChange: '&',//model内容改变事件
                    zDropdownDisabled: '=',//不可用
                    zDropdownWaiting: '='//下拉框等待，用于自身加载数据或者由外部控制等待等
                },
                link: function (scope, element, attributes) {

                    scope.config = {
                        showOptions: false
                    };

                    function checkClickMe(meKey, target) {
                        if (target.$$hashKey && target.$$hashKey === meKey) {
                            return;
                        }
                        else if (target.parentElement) {
                            if (target.parentElement.nodeName === 'BODY') {
                                if (scope.config.showOptions) {
                                    scope.config.showOptions = false;
                                }
                                return;
                            }
                            checkClickMe(meKey, target.parentElement);
                        }
                        else {
                            if (scope.config.showOptions)
                                scope.config.showOptions = false;
                        }
                    }

                    scope.$on(GlobalEvent.onBodyClick, function (evt, data) {
                        if(!element[0] || !element[0].$$hashKey || !data || !data.target){
                            return;
                        }
                        checkClickMe(element[0].$$hashKey, data.target);
                    });

                    scope.elementClick = function (event) {
                        if (scope.zDropdownDisabled || scope.zDropdownWaiting) {
                            return;
                        }
                        scope.config.showOptions = !scope.config.showOptions;
                    };

                    scope.selectOption = function (option, event) {
                        if (event) {
                            event.stopPropagation();
                        }
                        if(option.disabled){
                            return;
                        }
                        scope.zDropdownModel = option;
                        $timeout(function () {
                            if (scope.zDropdownChange) {
                                scope.zDropdownChange();
                            }
                        });
                        scope.config.showOptions = false;
                    };

                    scope.generalSelectedText = function () {
                        if (!scope.zDropdownModel || !scope.zDropdownModel.text) {
                            return attributes.zDropdownLabel || '';
                        }
                        var modelType = typeof(scope.zDropdownModel);
                        var result = '';
                        switch (modelType) {
                            case 'string':
                                result = scope.zDropdownModel;
                                break;
                            case 'object':
                                result = scope.zDropdownModel.text;
                                break;
                            default:
                                result = '';
                                break;
                        }
                        return result;
                    };
                }
            };
        }]);
