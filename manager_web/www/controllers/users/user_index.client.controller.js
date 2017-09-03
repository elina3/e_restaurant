/**
 * Created by elinaguo on 16/3/14.
 */
'use strict';
angular.module('EWeb').controller('UserIndexController',
  ['$window', '$rootScope', '$scope', 'GlobalEvent', '$state', 'UserService', 'Auth',
    function ($window, $rootScope, $scope, GlobalEvent, $state, UserService, Auth) {
      var user = Auth.getUser();
      if (!user) {
        $state.go('user_sign_in');
        return;
      }
      $scope.pageConfig = {
        groupList: []
      };

      $scope.goBack = function () {
        $window.history.back();
      };


      $scope.goState = function (state) {
        if (!state) {
          return;
        }
        $state.go(state);
      };
      $scope.goToView = function (state) {
        if (!state) {
          return;
        }

        switch (state) {
          case 'user_manager':
            return $state.go('user_manager');
          case 'restaurant':
            $state.go('goods_manager', {goods_type: 'dish'});
            return;
          case 'supermarket':
            if (user.role === 'admin' || user.role === 'supermarket_manager') {
              $state.go('supermarket_order');
            }
            return;
          default:
            return;
        }
      };

      function init() {

        $scope.$emit(GlobalEvent.onShowLoading, true);
        UserService.getGroups({currentPage: 1, limit: -1, skipCount: 0}, function (err, data) {
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err) {
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }
          $scope.pageConfig.groupList = data.group_list;
          console.log($scope.pageConfig.groupList);
        });
      }

      init();
    }]);
