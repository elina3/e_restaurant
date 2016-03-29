/**
 * Created by elinaguo on 15/5/16.
 */
/**
 * function: 分页UI
 * author: elina
 *
 *  html代码
 *  <zz-pagination config="pagination"></zz-pagination>
 *
 *  angularjs代码
 $scope.pagination= {
                  currentPage: 1,                     //default
                  limit: 20,                          //default   每页显示几条
                  pageNavigationCount: 5,             //default   分页显示几页
                  totalCount: 0,
                  pageCount: 0,
                  limitArray: [10, 20, 30, 40, 100],  //default   每页显示条数数组
                  pageList: [1],                      //显示几页的数字数组
                  canSeekPage: true,                  //default   是否可以手动定位到第几页
                  canSetLimit: true,                  //default   是否可以设置每页显示几页
                  isShowTotalInfo: true,              //default   是否显示总记录数信息
                  onCurrentPageChanged: null or function(callback){
                                                  //do something
                                                  function(data){
                                                    //data.totalCount, data.limit
                                                    callback(data);
                                                  }
                                                }
              };
 $scope.pagination.render(); //渲染pagination
 *  }
 *
 */

'use strict';


angular.module('EWeb').directive('zPagination', [function () {
    return {
        restrict: 'EA',
        templateUrl: 'directives/z_pagination/z_pagination.client.directive.html',
        replace: true,
        scope: {
            config: '='
        },

        link: function (scope, element, attributes) {
            if (!scope.config) {
                scope.config = {};
            }

            function initConfig() {
                if (!scope.config.currentPage || scope.config.currentPage === 0) {
                    scope.config.currentPage = 1;
                }

                if (!scope.config.limit || scope.config.limit === 0) {
                    scope.config.limit = 20;
                }

                if (!scope.config.totalCount) {
                    scope.config.totalCount = 0;
                }

                if (!scope.config.pageCount) {
                    scope.config.pageCount = 0;
                }

                if (!scope.config.limitArray || scope.config.limitArray.length === 0) {
                    scope.config.limitArray = [10, 20, 30, 50, 100];
                }

                if (!scope.config.pageNavigationCount || scope.config.pageNavigationCount === 0) {
                    scope.config.pageNavigationCount = 5;
                }

                if (scope.config.isShowTotalInfo === undefined || scope.config.isShowTotalInfo === null) {
                    scope.config.isShowTotalInfo = true;
                }

                if (scope.config.canSetLimit === undefined || scope.config.canSetLimit === null) {
                    scope.config.canSetLimit = false;
                }

                if (scope.config.canSeekPage === undefined || scope.config.canSeekPage === null) {
                    scope.config.canSeekPage = false;
                }

                if (!scope.config.onChange) {
                    scope.onChange = function () {
                        console.log('Turn to the ' + scope.config.currentPage + ' page');
                    };
                }
            }

            scope.config.changePage = function (newPage) {
                switchPage(newPage);
            };

            scope.config.seekPage = function (newPage) {
                if (!newPage)
                    return;

                newPage = parseInt(newPage);
                if (newPage > scope.config.pageCount) {
                    return;
                }

                switchPage(newPage);
            };

            scope.config.changePageLimit = function () {
                scope.config.currentPage = 1;
                //limit已经通过ng－model改变
                scope.config.onCurrentPageChanged(function () {
                    scope.config.pageCount = Math.ceil(scope.config.totalCount / scope.config.limit);
                    refreshPageNavigation();
                });
            };

            scope.$watchCollection('config', function () {
                refreshPageNavigation();
            });

            function refreshPageNavigation() {
                if (scope.config.currentPage === '' || scope.config.currentPage <= 0) {
                    scope.config.currentPage = 1;
                    return;
                }
                scope.config.pageList = scope.config.pageList || [];
                scope.config.pageList.splice(0, scope.config.pageList.length);

                if (scope.config.pageCount > scope.config.pageNavigationCount) {
                    var length = ((scope.config.currentPage + scope.config.pageNavigationCount - 1) > scope.config.pageCount) ? scope.config.pageCount : (scope.config.currentPage + scope.config.pageNavigationCount - 1 );
                    var currentViewNumber = length - scope.config.pageNavigationCount + 1;
                    for (var i = currentViewNumber; i <= length; i++) {
                        scope.config.pageList.push(i);
                    }
                } else {
                    for (var j = 1; j <= scope.config.pageCount; j++) {
                        scope.config.pageList.push(j);
                    }
                }
            }

            function switchPage(newPage) {
                if (newPage === scope.config.currentPage) {
                    return;
                }
                scope.config.currentPage = newPage;

                if (!scope.config.onCurrentPageChanged) {
                    return;
                }

                scope.config.onCurrentPageChanged(function () {
                    scope.config.pageCount = Math.ceil(scope.config.totalCount / scope.config.limit);
                    refreshPageNavigation();
                });
            }

            initConfig();
        }
    };
}]);
