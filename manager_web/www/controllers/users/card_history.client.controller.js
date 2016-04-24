/**
 * Created by elinaguo on 16/4/24.
 */

'use strict';
angular.module('EWeb').controller('CardHistoryController',
  ['$rootScope', '$scope', 'GlobalEvent', '$state', 'CardHistoryService', 'Config', '$window',
    function ($rootScope, $scope, GlobalEvent, $state, CardHistoryService, Config, $window) {

      $scope.pageData = {
        keyword: '',
        pagination: {
          currentPage: 1,
          limit: 10,
          totalCount: 0,
          isShowTotalInfo: true,
          onCurrentPageChanged: function (callback) {
            loadCardHistories();
          }
        },
        cardHistories: []
      };


      $scope.searchKey = function(){
        loadCardHistories();
      };
      $scope.goBack = function () {
        $window.history.back();
      };


      function loadCardHistories(){
        $scope.$emit(GlobalEvent.onShowLoading, true);
        CardHistoryService.getCardHistories($scope.pageData.pagination,
          $scope.pageData.keyword,function(err, data){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if(err || !data){
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          $scope.pageData.cardHistories = data.card_history_list;
          $scope.pageData.pagination.totalCount = data.total_count;
          $scope.pageData.pagination.limit = data.limit;
          $scope.pageData.pagination.pageCount = Math.ceil($scope.pageData.pagination.totalCount / $scope.pageData.pagination.limit);
        });
      }

      function init(){
        loadCardHistories();
      }
      init();
    }]);
