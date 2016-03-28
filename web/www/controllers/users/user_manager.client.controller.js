/**
 * Created by elinaguo on 16/3/16.
 */
'use strict';
angular.module('EWeb').controller('UserManagerController',
  ['$window', '$rootScope', '$scope', 'GlobalEvent', '$state', 'UserService',
    function ($window, $rootScope, $scope, GlobalEvent, $state, UserService) {

      $scope.pageConfig = {
        roles: [{id: 'waiter', text: '服务员'},{id: 'cashier', text: '收银员'},{id:'card_manager',text:'饭卡管理员'}],
        groups: [],
        currentTag: 'platform-user',
        groupList: [],
        popMaskShow: false,
        plat_user_panel: {
          users: [],
          currentEditUser: null,
          pagination: {
            currentPage: 1,
            limit: 10,
            totalCount: 0
          }
        },
        users: [],

        client_users:[]
      };

      $scope.goBack = function () {
        $window.history.back();
      };

      $scope.changeTag = function(tagName){
        $scope.pageConfig.currentTag = tagName;
      };

      $scope.scanUser = function(){
        $scope.pageConfig.popMaskShow = true;
        $scope.pageConfig.scanType = 'scan';
      };

      $scope.closePopMask = function(){
        $scope.pageConfig.popMaskShow = false;
        $scope.pageConfig.scanType = '';
      };

      $scope.editUser = function(user){
        //if(!user){
        //  $scope.pageConfig.plat_user_panel.currentEditUser = {
        //    username: '',
        //    password: '',
        //
        //  };
        //}
        $scope.pageConfig.popMaskShow = true;
        $scope.pageConfig.addPanel = true;
        $scope.pageConfig.scanType = 'edit';
      };


      function init(){
        $scope.$emit(GlobalEvent.onShowLoading, true);
        UserService.getGroups({currentPage: 1,limit: -1, skipCount: 0}, function (err, data) {
          if (err) {
            $scope.$emit(GlobalEvent.onShowLoading, false);
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }
          $scope.pageConfig.groupList = data.group_list;

          UserService.getUsers($scope.pageConfig.plat_user_panel.pagination,function(err, data){
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if (err) {
              return $scope.$emit(GlobalEvent.onShowAlert, err);
            }

            console.log(data);
            $scope.$emit(GlobalEvent.onShowLoading, false);

          });
        });
      }

      init();
    }]);
