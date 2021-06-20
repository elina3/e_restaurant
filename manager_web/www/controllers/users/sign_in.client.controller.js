/**
* Created by louisha on 15/6/19.
*/
'use strict';
angular.module('EWeb').controller('UserSignInController',
  ['$rootScope', '$scope', 'GlobalEvent', '$state', 'UserService', 'Config', '$window',
    function ($rootScope, $scope, GlobalEvent, $state, UserService, Config, $window) {

      $scope.signInObject = {
        username: '',
        password: ''
      };
      $scope.signIn = function () {
        if ($scope.signInObject.username === '') {
          $scope.$emit(GlobalEvent.onShowAlert, '请输入用户名');
          return;
        }
        if ($scope.signInObject.password === '') {
          $scope.$emit(GlobalEvent.onShowAlert, '请输入密码');
          return;
        }

        UserService.signIn($scope.signInObject, function(err, user){
          if (err) {
            $scope.$emit(GlobalEvent.onShowAlert, err);
            return;
          }

          if(!user){
            $scope.$emit(GlobalEvent.onShowAlert, '用户获取信息失败');
            return;
          }

          switch(user.role){
            case 'admin':
              return $state.go('user_index');
            case 'card_manager'://饭卡管理员（包括所有的卡）
              return $state.go('user_manager', {panel_type: 'card-user'});
            case 'normal_card_manager'://普通饭卡管理员
              return $state.go('user_manager', {panel_type: 'card-user'});
            case 'staff_card_manager'://员工专家饭卡管理员
              return $state.go('user_manager', {panel_type: 'card-user'});
            case 'cooker':
            case 'delivery':
              return $state.go('goods_order');
            case 'nurse':
              return $state.go('meal_setting');
            case 'registrar':
              return $state.go('hospitalized');
            case 'supermarket_manager':
              return $state.go('supermarket_order');
            case 'milk_manager':
              return $state.go('milk_order');
            default:
              return $state.go('user_index');
          }
        });
      };
      $scope.goToClientIndex = function(){
        $window.location.href = Config.serverAddress + '/#/client/sign_in';
      };
      $scope.goToClientPersonal = function(){
        $window.location.href = Config.serverAddress + '/#/client/personal_sign_in';
      };
    }]);
