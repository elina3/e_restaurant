/**
* Created by louisha on 15/6/19.
*/
'use strict';
angular.module('EWeb').controller('UserSignUpController',
  [ '$scope',
    'GlobalEvent',
    'UserService',
    function ($scope, GlobalEvent, UserService) {
      $scope.pageInfo = {
        title: '服务员注册',
        roles: [{key: 'waiter', value: '餐厅服务员'}, {key: 'cashier', value: '超市收银员'}, {key: 'card_manager', value: '饭卡充值员'}],
        groupList: []
      };
      $scope.signUpObject = {
        username: '',
        password: '',
        role: 'waiter',
        nickname: '',
        group_id: '',
        sex: 'male',
        mobile_phone: '',
        head_photo: ''
      };

      function initSignUpObject() {
        $scope.signUpObject.username = '';
        $scope.signUpObject.password = '';
        $scope.signUpObject.nickname = '';
        $scope.signUpObject.group_id = '';
        $scope.signUpObject.sex = '';
        $scope.signUpObject.role = 'waiter';
      }

      $scope.signUp = function () {
        if ($scope.signUpObject.username.length < 11) {
          return $scope.$emit(GlobalEvent.onShowAlert, '必须是11位的手机号码');
        }

        if ($scope.signUpObject.password.length < 6) {
          return $scope.$emit(GlobalEvent.onShowAlert, '密码必须大于6位数');
        }

        if ($scope.signUpObject.nickname === '') {
          return $scope.$emit(GlobalEvent.onShowAlert, '请输入姓名');
        }

        if ($scope.signUpObject.group_id === '') {
          return $scope.$emit(GlobalEvent.onShowAlert, '请选择所属医院');
        }

        $scope.$emit(GlobalEvent.onShowLoading, true);
        UserService.signUp($scope.signUpObject, function (err, data) {
          console.log(data);
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err) {
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          $scope.$emit(GlobalEvent.onShowAlert, '注册成功');
          initSignUpObject();
        });

      };

      function init() {
        $scope.$emit(GlobalEvent.onShowLoading, true);
        UserService.getGroups({currentPage: 1,limit: -1, skipCount: 0}, function (err, data) {
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err) {
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }
          $scope.pageInfo.groupList = data.group_list;
        });
      }

      init();
    }]);
