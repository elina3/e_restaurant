/**
 * Created by elinaguo on 16/4/8.
 */
'use strict';
angular.module('EClientWeb').controller('LogController',
  [
    '$rootScope',
    '$scope',
    '$window',
    'LogService',
    function ($rootScope,
              $scope,
              $window,
              LogService) {

      function loadLogs(callback){
        LogService.getLogs($scope.pageData.pagination, function(err, data){
          if(err){
            alert(err);
          }

          $scope.pageData.logs = data.logs || [];
          $scope.pageData.pagination.totalCount = data.total_count || 0;
          $scope.pageData.pagination.limit = data.limit;
          return callback(data);
        });
      }

      $scope.pageData = {
        title: '日志查看',
        pagination: {
          currentPage: 1,
          limit: 10,
          totalCount: 0,
          isShowTotalInfo: true,
          onCurrentPageChanged: function (callback) {
            loadLogs(function(data){
              $scope.pageData.pagination.pageCount = Math.ceil($scope.pageData.pagination.totalCount / $scope.pageData.pagination.limit);
            });
          }
        },
        logs: []
      };


      $scope.goBack = function(){
        $window.history.back();
      };

      function init(){
        loadLogs(function(data){
          $scope.pageData.pagination.pageCount = Math.ceil($scope.pageData.pagination.totalCount / $scope.pageData.pagination.limit);
        });
      }

      init();

    }]);

