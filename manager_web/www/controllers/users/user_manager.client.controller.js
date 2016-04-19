/**
 * Created by elinaguo on 16/3/16.
 */
'use strict';
angular.module('EWeb').controller('UserManagerController',
  ['$window', '$rootScope', '$stateParams', '$scope', 'GlobalEvent', '$state', 'UserService', 'UserError', 'CardService', 'ClientService',
    function ($window, $rootScope, $stateParams, $scope, GlobalEvent, $state, UserService, UserError, CardService, ClientService) {

      $scope.pageConfig = {
        clientScanType: '',
        clientRoles: [{id: 'normal', text: '普通用户'}, {id: 'waiter', text: '服务员'},{id: 'cashier', text: '收银员'},],
        roles: [{id:'card_manager',text:'饭卡管理员'}],
        groups: [],
        sexs: [{id: 'male', text: '男'},{id: 'female', text: '女'}],
        currentTag: 'platform-user',
        groupList: [{id: '', text: '餐厅'},{id: '', text: ''}],
        popMaskShow: false,
        plat_user_panel: {
          show_plat:false,
          users: [],
          currentEditUser: null,
          errorInfo: {
            username: false,
            password: false,
            nickname: false,
            group: false,
            mobile_phone: false,
            role: false
          },
          pagination: {
            currentPage: 1,
            limit: 10,
            totalCount: 0,
            isShowTotalInfo: true,
            onCurrentPageChanged: function (callback) {
              loadUsers();
            }
          }
        },
        plat_card_panel: {
          show_plat:false,
          cards: [],
          currentEditCard: null,
          errorInfo: {
            card_number: false
          },
          pagination: {
            currentPage: 1,
            limit: 10,
            totalCount: 0,
            isShowTotalInfo: true,
            onCurrentPageChanged: function (callback) {
              loadCards();
            }
          }
        },
        plat_client_panel: {
          show_plat:false,
          client_users: [],
          currentEditClient: null,
          errorInfo: {
            username: false,
            password: false,
            nickname: false,
            mobile_phone: false,
            role: false
          },
          pagination: {
            currentPage: 1,
            limit: 10,
            totalCount: 0,
            isShowTotalInfo: true,
            onCurrentPageChanged: function (callback) {
              loadClients();
            }
          }
        }
      };

      $scope.goBack = function () {
        $window.history.back();
      };

      $scope.changeTag = function(tagName){
        $scope.pageConfig.currentTag = tagName;
      };

      $scope.closePopMask = function(){
        $scope.pageConfig.popMaskShow = false;
        $scope.pageConfig.scanType = '';
        $scope.pageConfig.clientScanType = '';

        $scope.pageConfig.plat_user_panel.show_plat = false;
        $scope.pageConfig.plat_card_panel.show_plat = false;
        $scope.pageConfig.plat_client_panel.show_plat = false;
      };

      function reloadData(){
        if($stateParams.panel_type === $scope.pageConfig.currentTag){
          $window.location.reload();
        }else{
          $state.go('user_manager', {panel_type: $scope.pageConfig.currentTag});
        }
      }

      //<editor-fold desc="客户端用户相关">
      $scope.scanClient = function(client){
        $scope.pageConfig.popMaskShow = true;
        $scope.pageConfig.clientScanType = 'scan';
        $scope.pageConfig.plat_client_panel.currentEditClient = client;
      };
      function getNewClientObj(){
        return {
          username: '',
          password: '',
          nickname: '',
          mobile_phone: '',
          role: null
        };
      }
      $scope.editClient = function(client){
        if(!client){
          $scope.pageConfig.plat_client_panel.currentEditClient = getNewClientObj();

          $scope.pageConfig.clientScanType = 'create';
        }else{
          $scope.pageConfig.plat_client_panel.currentEditClient = client;
          $scope.pageConfig.clientScanType = 'edit';
        }
        $scope.pageConfig.popMaskShow = true;
        $scope.pageConfig.addPanel = true;
        $scope.pageConfig.plat_client_panel.show_plat=true;
      };
      $scope.deleteClient = function(client){
        $scope.$emit(GlobalEvent.onShowLoading, true);
        ClientService.deleteClient(client._id, function(err, result){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if(err){
            $scope.$emit(GlobalEvent.onShowAlert, UserError[err]||err);
          }

          $scope.$emit(GlobalEvent.onShowAlert, '删除成功！');
          reloadData();
        });
      };
      function validClientInfo(client){
        var isPassed = true;
        if(!client.username){
          $scope.pageConfig.plat_client_panel.errorInfo.username = true;
          isPassed = false;
        }
        if(!client.password || client.password.length <6){
          $scope.pageConfig.plat_client_panel.errorInfo.password = true;
          isPassed = false;
        }
        if(!client.nickname){
          $scope.pageConfig.plat_client_panel.errorInfo.nickname = true;
          isPassed = false;
        }
        if(!client.mobile_phone){
          $scope.pageConfig.plat_client_panel.errorInfo.mobile_photo = true;
          isPassed = false;
        }

        if(!client.role){
          $scope.pageConfig.plat_client_panel.errorInfo.role = true;
          isPassed = false;
        }
        return isPassed;
      }
      function clearClientError(){
        $scope.pageConfig.plat_client_panel.errorInfo.username = false;
        $scope.pageConfig.plat_client_panel.errorInfo.password = false;
        $scope.pageConfig.plat_client_panel.errorInfo.nickname = false;
        $scope.pageConfig.plat_client_panel.errorInfo.mobile_phone = false;
        $scope.pageConfig.plat_client_panel.errorInfo.role = false;
      }
      function getIndexOfClients(username){
        for(var i=0;i<$scope.pageConfig.plat_client_panel.client_users.length;i++){
          if($scope.pageConfig.plat_client_panel.client_users[i].username === username){
            return i;
          }
        }
        return -1;
      }
      $scope.addOrEditClient = function(){
        $scope.$emit(GlobalEvent.onShowLoading, true);
        if(!validClientInfo($scope.pageConfig.plat_client_panel.currentEditClient)){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          return;
        }

        var index = getIndexOfClients($scope.pageConfig.plat_client_panel.currentEditClient.username);
        var param;

        if($scope.pageConfig.scanType === 'create' && index > -1){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          $scope.$emit(GlobalEvent.onShowAlert, '该用户名已存在，请更换用户名');
          return;
        }
        param = {
          _id: $scope.pageConfig.plat_client_panel.currentEditClient._id,
          username: $scope.pageConfig.plat_client_panel.currentEditClient.username,
          password: $scope.pageConfig.plat_client_panel.currentEditClient.password,
          role: $scope.pageConfig.plat_client_panel.currentEditClient.role.id,
          nickname: $scope.pageConfig.plat_client_panel.currentEditClient.nickname,
          sex: $scope.pageConfig.plat_client_panel.currentEditClient.sex ? $scope.pageConfig.plat_client_panel.currentEditClient.sex.id : '',
          mobile_phone: $scope.pageConfig.plat_client_panel.currentEditClient.mobile_phone,
          head_photo: ''
        };
        if($scope.pageConfig.clientScanType === 'create'){

          ClientService.addNewClient(param, function(err, data){
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if (err) {
              return $scope.$emit(GlobalEvent.onShowAlert, UserError[err] || err);
            }

            clearClientError();
            $scope.closePopMask();
            $scope.$emit(GlobalEvent.onShowAlert, '添加成功');
            reloadData();
          });
        }else{
          ClientService.modifyClient(param, function(err, data){
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if (err) {
              return $scope.$emit(GlobalEvent.onShowAlert, UserError[err] || err);
            }

            clearClientError();
            $scope.closePopMask();
            $scope.$emit(GlobalEvent.onShowAlert, '修改成功');
            reloadData();
          });
        }
      };
      $scope.resetClient = function(){
        $scope.pageConfig.plat_client_panel.currentEditClient = getNewUserObj();
        clearClientError();
      };
      $scope.cancelClient = function(){
        $scope.pageConfig.popMaskShow = false;
        $scope.pageConfig.clientScanType = '';
        clearClientError();
      };
      function loadClients(){
        $scope.pageConfig.plat_client_panel.users = [];
        ClientService.getClients($scope.pageConfig.plat_client_panel.pagination,function(err, data){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err) {
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          data.clients.forEach(function(client){
            $scope.pageConfig.plat_client_panel.client_users.push({
              _id: client._id,
              username: client.username,
              password: client.password,
              nickname: client.nickname,
              sex: client.sex === 'male' ? {id: client.sex, text: '男'} : (client.sex === 'female' ? {id: client.sex, text: '女'}: null),
              role: client.role ? {id: client.role, text: ClientService.translateClientRole(client.role)} : null,
              mobile_phone: client.mobile_phone
            });
          });

          $scope.pageConfig.plat_client_panel.pagination.totalCount = data.total_count;
          $scope.pageConfig.plat_client_panel.pagination.limit = data.limit;
          $scope.pageConfig.plat_client_panel.pagination.pageCount = Math.ceil($scope.pageConfig.plat_client_panel.pagination.totalCount / $scope.pageConfig.plat_client_panel.pagination.limit);

        });
      }
      //</editor-fold>

      //<editor-fold desc="平台用户相关">
      $scope.scanUser = function(user){
        $scope.pageConfig.popMaskShow = true;
        $scope.pageConfig.scanType = 'scan';
        $scope.pageConfig.plat_user_panel.currentEditUser = user;
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
        $scope.pageConfig.plat_user_panel.show_plat=true;
      };
      $scope.deleteUser = function(user){
        $scope.$emit(GlobalEvent.onShowLoading, true);
        UserService.deleteUser(user._id, function(err, user){

          $scope.$emit(GlobalEvent.onShowLoading, false);
          if(err){
            $scope.$emit(GlobalEvent.onShowAlert, UserError[err]||err);
          }

          $scope.$emit(GlobalEvent.onShowAlert, '删除成功！');
          reloadData();
        });
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
      function getIndexOfUsers(username){
        for(var i=0;i<$scope.pageConfig.plat_user_panel.users.length;i++){
          if($scope.pageConfig.plat_user_panel.users[i].username === username){
            return i;
          }
        }
        return -1;
      }
      $scope.addOrEditUser = function(){
        $scope.$emit(GlobalEvent.onShowLoading, true);
        if(!validUserInfo($scope.pageConfig.plat_user_panel.currentEditUser)){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          return;
        }

        var index = getIndexOfUsers($scope.pageConfig.plat_user_panel.currentEditUser.username);
        var param;

        if($scope.pageConfig.scanType === 'create' && index > -1){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          $scope.$emit(GlobalEvent.onShowAlert, '该用户名已存在，请更换用户名');
          return;
        }
        param = {
          username: $scope.pageConfig.plat_user_panel.currentEditUser.username,
          password: $scope.pageConfig.plat_user_panel.currentEditUser.password,
          role: $scope.pageConfig.plat_user_panel.currentEditUser.role.id,
          nickname: $scope.pageConfig.plat_user_panel.currentEditUser.nickname,
          group_id: $scope.pageConfig.plat_user_panel.currentEditUser.group.id,
          sex: $scope.pageConfig.plat_user_panel.currentEditUser.sex ? $scope.pageConfig.plat_user_panel.currentEditUser.sex.id : '',
          mobile_phone: $scope.pageConfig.plat_user_panel.currentEditUser.mobile_phone,
          head_photo: ''
        };
        if($scope.pageConfig.scanType === 'create'){

          UserService.signUp(param, function(err, data){
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if (err) {
              return $scope.$emit(GlobalEvent.onShowAlert, UserError[err] || err);
            }

            clearError();
            $scope.closePopMask();
            $scope.$emit(GlobalEvent.onShowAlert, '添加成功');
            reloadData();
          });
        }else{

          UserService.modifyUser(param, function(err, data){
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if (err) {
              return $scope.$emit(GlobalEvent.onShowAlert, UserError[err] || err);
            }

            clearError();
            $scope.closePopMask();
            $scope.$emit(GlobalEvent.onShowAlert, '修改成功');
            reloadData();
          });
        }
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
      function loadUsers(){
        $scope.pageConfig.plat_user_panel.users = [];
        UserService.getUsers($scope.pageConfig.plat_user_panel.pagination,function(err, data){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err) {
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          data.users.forEach(function(user){
            $scope.pageConfig.plat_user_panel.users.push({
              _id: user._id,
              username: user.username,
              password: user.password,
              nickname: user.nickname,
              sex: user.sex === 'male' ? {id: user.sex, text: '男'} : (user.sex === 'female' ? {id: user.sex, text: '女'}: null),
              group: {id: user.group._id, text: user.group.name},
              role: user.role ? {id: user.role, text: UserService.translateUserRole(user.role)} : null,
              mobile_phone: user.mobile_phone
            });
          });

          $scope.pageConfig.plat_user_panel.pagination.totalCount = data.total_count;
          $scope.pageConfig.plat_user_panel.pagination.limit = data.limit;
          $scope.pageConfig.plat_user_panel.pagination.pageCount = Math.ceil($scope.pageConfig.plat_user_panel.pagination.totalCount / $scope.pageConfig.plat_user_panel.pagination.limit);

        });
      }
      //</editor-fold>

      //<editor-fold desc="饭卡相关">
      function loadCards(keyword){
        $scope.pageConfig.plat_card_panel.cards = [];
        CardService.getCards($scope.pageConfig.plat_card_panel.pagination,keyword,function(err, data){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err) {
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }
          //console.log($scope.pageConfig.plat_user_panel.pagination);
          console.log(data);
          data.card_list.forEach(function(card){
            $scope.pageConfig.plat_card_panel.cards.push({
              _id: card._id,
              registration_number:card.registration_number,
              card_number: card.card_number,
              money: card.money,
              status: card.status=='disabled'?'已禁用':'已启用',
              create_time:card.create_time,
              update_time:card.update_time
            });
          });

          $scope.pageConfig.plat_card_panel.pagination.totalCount = data.total_count;
          $scope.pageConfig.plat_card_panel.pagination.limit = data.limit;
          $scope.pageConfig.plat_card_panel.pagination.pageCount = Math.ceil($scope.pageConfig.plat_card_panel.pagination.totalCount / $scope.pageConfig.plat_card_panel.pagination.limit);

        });
      }
      $scope.editCard = function(card){

        if(!card){
          $scope.pageConfig.plat_card_panel.currentEditCard = getNewCardObj();

          $scope.pageConfig.scanType = 'create';
        }else{
          $scope.pageConfig.plat_card_panel.currentEditCard = card;
          $scope.pageConfig.scanType = 'edit';
        }
        $scope.pageConfig.popMaskShow = true;
        $scope.pageConfig.addPanel = true;
        $scope.pageConfig.plat_card_panel.show_plat=true;
      };
      $scope.addOrEditCard = function(){
        $scope.$emit(GlobalEvent.onShowLoading, true);
        if(!validCardInfo($scope.pageConfig.plat_card_panel.currentEditCard)){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          return;
        }

        var index = getIndexOfCards($scope.pageConfig.plat_card_panel.currentEditCard.card_number);
        var param;

        if($scope.pageConfig.scanType === 'create' && index > -1){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          $scope.$emit(GlobalEvent.onShowAlert, '该卡号已存在，请更换');
          return;
        }
        param = {
          card_number: $scope.pageConfig.plat_card_panel.currentEditCard.card_number,
          registration_number: $scope.pageConfig.plat_card_panel.currentEditCard.registration_number,
          money:$scope.pageConfig.plat_card_panel.currentEditCard.money
        };
        if($scope.pageConfig.scanType === 'create'){

          CardService.addCard(param, function(err, data){
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if (err) {
              return $scope.$emit(GlobalEvent.onShowAlert, UserError[err] || err);
            }

            clearError();
            $scope.closePopMask();
            $scope.$emit(GlobalEvent.onShowAlert, '添加成功');
            reloadData();
          });
        }else{

          CardService.modifyCard($scope.pageConfig.plat_card_panel.currentEditCard._id,param, function(err, data){
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if (err) {
              return $scope.$emit(GlobalEvent.onShowAlert, UserError[err] || err);
            }

            clearError();
            $scope.closePopMask();
            $scope.$emit(GlobalEvent.onShowAlert, '修改成功');
            reloadData();
          });
        }
      };

      $scope.deleteCard = function(card){
        $scope.$emit(GlobalEvent.onShowLoading, true);
        CardService.deleteCard(card._id, function(err, card){

          $scope.$emit(GlobalEvent.onShowLoading, false);
          if(err){
            $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          $scope.$emit(GlobalEvent.onShowAlert, '删除成功！');
          //$state.reload();
          loadCards();
        });
      };

      $scope.searchCards=function(){
        console.log($scope.keyword);
        loadCards($scope.keyword);
      };

      function getNewCardObj(){
        return {
          card_number: ''
        };
      }
      function validCardInfo(card) {
        var isPassed = true;
        if (!card.card_number) {
          $scope.pageConfig.plat_card_panel.errorInfo.card_number = true;
          isPassed = false;
        }
        return isPassed;
      }
      function getIndexOfCards(card_number){
        for(var i=0;i<$scope.pageConfig.plat_card_panel.cards.length;i++){
          if($scope.pageConfig.plat_card_panel.cards[i].card_number === card_number){
            return i;
          }
        }
        return -1;
      }
      //</editor-fold>

      function init(){
        var panelType = $stateParams.panel_type;
        if(panelType){
          $scope.pageConfig.currentTag = panelType;
        }

        $scope.$emit(GlobalEvent.onShowLoading, true);
        UserService.getGroups({currentPage: 1,limit: -1, skipCount: 0}, function (err, data) {
          if (err) {
            $scope.$emit(GlobalEvent.onShowLoading, false);
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          data.group_list.forEach(function(group){
            $scope.pageConfig.groups.push({id: group._id, text: group.name});
          });

          loadUsers();
          loadCards();
          loadClients();
        });
      }
      init();
    }]);
