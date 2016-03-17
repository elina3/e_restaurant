/**
 * Created by elinaguo on 16/3/16.
 */
'use strict';
angular.module('EWeb').controller('GoodsManagerController',
  ['$stateParams', '$window', '$rootScope', '$scope', 'GlobalEvent', '$state', 'UserService',
    function ($stateParams, $window, $rootScope, $scope, GlobalEvent, $state, UserService) {

      $scope.pageConfig = {
        title: '',
        type: '',
        groupList: []
      };

      $scope.goBack = function () {
        $window.history.back();
      };

      function init(){

        switch($stateParams.goods_type){
          case 'goods':
            $scope.pageConfig.title = '超市管理';
            $scope.pageConfig.type = 'supermarket';
            return;
          case 'dish':
            $scope.pageConfig.title = '餐厅管理';
            $scope.pageConfig.type = 'restaurant';
            return;
          default:
            $scope.pageConfig.title = '餐厅管理';
            $scope.pageConfig.type = 'restaurant';
            return;
        }
        //UserService.getGroups({currentPage: 1,limit: -1, skipCount: 0}, function (err, data) {
        //  $scope.$emit(GlobalEvent.onShowLoading, false);
        //  if (err) {
        //    return $scope.$emit(GlobalEvent.onShowAlert, err);
        //  }
        //  $scope.pageInfo.groupList = data.group_list;
        //});
      }

      init();
    }]);
