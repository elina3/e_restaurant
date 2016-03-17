/**
 * Created by elinaguo on 16/3/16.
 */
'use strict';
angular.module('EWeb').controller('UserManagerController',
  ['$window', '$rootScope', '$scope', 'GlobalEvent', '$state', 'UserService',
    function ($window, $rootScope, $scope, GlobalEvent, $state, UserService) {

      $scope.pageConfig = {
        title: '',
        groupList: []
      };

      $scope.goBack = function () {
        $window.history.back();
      };

      function init(){
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
