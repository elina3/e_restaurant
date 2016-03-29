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
        sexs: [{id: 'male', text: '男'},{id: 'female', text: '女'}],
        currentTag: 'platform-user',
        groupList: [{id: '', text: '餐厅'},{id: '', text: ''}],
        popMaskShow: false,
        plat_user_panel: {
          users: [{_id: '123456789', username: 'E23442579359',password: '123456', nickname: '小平', mobile_phone: '18321740715', role: {id:'waiter', text: '服务员'}, group: {id: '123456', text: '餐厅'}, sex: {id: 'female', text:'女'}}],
          currentEditUser: null,
          errorInfo: {
            username: false,
            password: false,
            nickname: false,
            group: false,
            mobile_photo: false,
            role: false
          },
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

      function getNewUserObj(){
        return {
          username: '',
          password: '',
          nickname: '',
          mobile_phone: '',
          group: null,
          role: null
        };
      }

      $scope.editUser = function(user){
        if(!user){
          $scope.pageConfig.plat_user_panel.currentEditUser = getNewUserObj();

          $scope.pageConfig.scanType = 'create';
        }else{
          $scope.pageConfig.plat_user_panel.currentEditUser = user;
          $scope.pageConfig.scanType = 'edit';
        }
        $scope.pageConfig.popMaskShow = true;
        $scope.pageConfig.addPanel = true;
      };

      function validUserInfo(user){
        var isPassed = true;
        if(!user.username){
          $scope.pageConfig.plat_user_panel.errorInfo.username = true;
          isPassed = false;
        }
        if(!user.password || user.password.length <6){
          $scope.pageConfig.plat_user_panel.errorInfo.password = true;
          isPassed = false;
        }
        if(!user.nickname){
          $scope.pageConfig.plat_user_panel.errorInfo.nickname = true;
          isPassed = false;
        }
        if(!user.mobile_phone){
          $scope.pageConfig.plat_user_panel.errorInfo.mobile_photo = true;
          isPassed = false;
        }
        if(!user.group){
          $scope.pageConfig.plat_user_panel.errorInfo.group = true;
          isPassed = false;
        }
        if(!user.role){
          $scope.pageConfig.plat_user_panel.errorInfo.role = true;
          isPassed = false;
        }
        return isPassed;
      }

      function clearError(){
        $scope.pageConfig.plat_user_panel.errorInfo.username = false;
        $scope.pageConfig.plat_user_panel.errorInfo.password = false;
        $scope.pageConfig.plat_user_panel.errorInfo.nickname = false;
        $scope.pageConfig.plat_user_panel.errorInfo.mobile_phone = false;
        $scope.pageConfig.plat_user_panel.errorInfo.group = false;
        $scope.pageConfig.plat_user_panel.errorInfo.role = false;
      }

      function getIndexOfUsers(user){
        for(var i=0;i<$scope.pageConfig.plat_user_panel.users.length;i++){
          if($scope.pageConfig.plat_user_panel.users[i].username === user.username){
            return i;
          }
        }
        return -1;
      }
      $scope.addOrEditUser = function(){
        if(!validUserInfo($scope.pageConfig.plat_user_panel.currentEditUser)){
          return;
        }

        if($scope.pageConfig.scanType === 'create'){

          //服务端的signup
          var param = {
            username: $scope.pageConfig.plat_user_panel.currentEditUser.username,
            password: $scope.pageConfig.plat_user_panel.currentEditUser.password,
            role: $scope.pageConfig.plat_user_panel.currentEditUser.role.id,
            nickname: $scope.pageConfig.plat_user_panel.currentEditUser.nickname,
            group_id: $scope.pageConfig.plat_user_panel.currentEditUser.group.id,
            sex: $scope.pageConfig.plat_user_panel.currentEditUser.sex ? $scope.pageConfig.plat_user_panel.currentEditUser.sex.id : '',
            mobile_phone: $scope.pageConfig.plat_user_panel.currentEditUser.mobile_phone,
            head_photo: ''
          };
          UserService.signUp(param, function(err, data){
            console.log(data);
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if (err) {
              return $scope.$emit(GlobalEvent.onShowAlert, err);
            }

            $scope.pageConfig.plat_user_panel.users.push($scope.pageConfig.plat_user_panel.currentEditUser);
            $scope.$emit(GlobalEvent.onShowAlert, '注册成功');
          });
          return;
        }else{
          var index = getIndexOfUsers();
          if(index === -1){
            $scope.pageConfig.plat_user_panel.users.push($scope.pageConfig.plat_user_panel.currentEditUser);
          }else{
            $scope.pageConfig.plat_user_panel.users[index] = $scope.pageConfig.plat_user_panel.currentEditUser;
          }
        }

        clearError();
        $scope.closePopMask();
      };

      $scope.reset = function(){
        $scope.pageConfig.plat_user_panel.currentEditUser = getNewUserObj();
        clearError();
      };

      $scope.cancel = function(){
        $scope.pageConfig.popMaskShow = false;
        $scope.pageConfig.scanType = '';
        clearError();
      };


      function init(){
        $scope.$emit(GlobalEvent.onShowLoading, true);
        UserService.getGroups({currentPage: 1,limit: -1, skipCount: 0}, function (err, data) {
          if (err) {
            $scope.$emit(GlobalEvent.onShowLoading, false);
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }
          console.log('group');
          console.log(data);
          data.group_list.forEach(function(group){
            $scope.pageConfig.groups.push({id: group._id, text: group.name});
          });

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
