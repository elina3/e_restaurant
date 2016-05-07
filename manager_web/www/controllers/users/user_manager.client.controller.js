/**
 * Created by elinaguo on 16/3/16.
 */
'use strict';
angular.module('EWeb').controller('UserManagerController',
  ['$window', '$rootScope', '$stateParams', '$scope', 'GlobalEvent', '$state', 'UserService', 'UserError', 'CardService', 'ClientService', 'Auth',
    function ($window, $rootScope, $stateParams, $scope, GlobalEvent, $state, UserService, UserError, CardService, ClientService, Auth) {

      if(!Auth.getUser()){
        $state.go('user_sign_in');
        return;
      }

      $scope.batchRechargeShow = false;
      $scope.pageConfig = {
        clientScanType: '',
        clientRoles: [{id: 'normal', text: '普通用户'}, {id: 'waiter', text: '服务员'},{id: 'cashier', text: '收银员'},],
        roles: [{id:'card_manager',text:'饭卡管理员'}, {id: 'delivery', text: '配送员'}, {id: 'cooker', text: '厨师'}],
        cardTypes: [{id: 'normal', text: '普通'},{id: 'staff', text: '员工'}],
        groups: [],
        sexs: [{id: 'male', text: '男'},{id: 'female', text: '女'}],
        currentTag: 'platform-user',
        groupList: [{id: '', text: '餐厅'},{id: '', text: ''}],
        popMaskShow: false,
        plat_user_panel: {
          show_plat:false,
          passwordModify: false,
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
          batchRechargeCardAmount: 0,
          totalCardBalance: 0,
          keyword: {
            card_number: '',
            registration_id: ''
          },
          show_plat:false,
          cards: [],
          currentEditCard: null,
          add_money: 0,
          errorInfo: {
            card_number: false,
            id_number: false,
            type: false
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
          passwordModify: false,
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

      $scope.user = Auth.getUser();

      $scope.goBack = function () {
        $window.history.back();
      };

      $scope.changeTag = function(tagName){
        if(tagName === $scope.pageConfig.currentTag){
          return;
        }

        $scope.pageConfig.currentTag = tagName;
        switch (tagName){
          case 'client-user':

            $scope.pageConfig.plat_client_panel.pagination.totalCount = 0;
            $scope.pageConfig.plat_client_panel.pagination.currentPage = 1;
            $scope.pageConfig.plat_client_panel.pagination.pageCount = 1;
            loadClients();
            return;
          case 'card-user':
            $scope.pageConfig.plat_card_panel.pagination.totalCount = 0;
            $scope.pageConfig.plat_card_panel.pagination.currentPage = 1;
            $scope.pageConfig.plat_card_panel.pagination.pageCount = 1;
            loadCards();
            return;
          case 'platform-user':

            $scope.pageConfig.plat_user_panel.pagination.totalCount = 0;
            $scope.pageConfig.plat_user_panel.pagination.currentPage = 1;
            $scope.pageConfig.plat_user_panel.pagination.pageCount = 1;
            loadUsers();
            return;
        }

      };

      $scope.closePopMask = function(){
        $scope.pageConfig.popMaskShow = false;
        $scope.pageConfig.scanType = '';
        $scope.pageConfig.clientScanType = '';

        $scope.pageConfig.plat_user_panel.show_plat = false;
        $scope.pageConfig.plat_card_panel.show_plat = false;
        $scope.pageConfig.plat_client_panel.show_plat = false;
        $scope.batchRechargeShow = false;

        $scope.pageConfig.plat_client_panel.passwordModify = false;
        $scope.pageConfig.plat_user_panel.passwordModify = false;
      };

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
        $scope.$emit(GlobalEvent.onShowAlertConfirm,
          {title: '确认操作', content: '您确定要删除该客户用户吗？', callback: function () {
            $scope.$emit(GlobalEvent.onShowLoading, true);
            ClientService.deleteClient(client._id, function(err, result){
              $scope.$emit(GlobalEvent.onShowLoading, false);
              if(err){
                $scope.$emit(GlobalEvent.onShowAlert, UserError[err]||err);
              }

              $scope.$emit(GlobalEvent.onShowAlert, '删除成功！');
              loadClients();
            });
          }});
      };
      function validClientInfo(client){
        var isPassed = true;
        if(!client.username){
          $scope.pageConfig.plat_client_panel.errorInfo.username = true;
          isPassed = false;
        }
        if($scope.pageConfig.plat_client_panel.passwordModify && (!client.password || client.password.length <6)){
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
          password_modify: $scope.pageConfig.plat_client_panel.passwordModify,
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
            loadClients();
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
            loadClients();
          });
        }
        $scope.pageConfig.plat_client_panel.passwordModify = false;
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
        $scope.pageConfig.plat_client_panel.client_users = [];
        ClientService.getClients($scope.pageConfig.plat_client_panel.pagination,function(err, data){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err) {
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          data.clients.forEach(function(client){
            $scope.pageConfig.plat_client_panel.client_users.push({
              _id: client._id,
              username: client.username,
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
        $scope.$emit(GlobalEvent.onShowAlertConfirm,
          {title: '确认操作', content: '您确定要删除该用户吗？', callback: function () {
            $scope.$emit(GlobalEvent.onShowLoading, true);
            UserService.deleteUser(user._id, function(err, user){

              $scope.$emit(GlobalEvent.onShowLoading, false);
              if(err){
                $scope.$emit(GlobalEvent.onShowAlert, UserError[err]||err);
              }

              $scope.$emit(GlobalEvent.onShowAlert, '删除成功！');
              loadUsers();
            });
          }});
      };
      function validUserInfo(user){
        var isPassed = true;
        if(!user.username){
          $scope.pageConfig.plat_user_panel.errorInfo.username = true;
          isPassed = false;
        }
        if( $scope.pageConfig.plat_user_panel.passwordModify && (!user.password || user.password.length <6)){
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
          password_modify: $scope.pageConfig.plat_user_panel.passwordModify,
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
            loadUsers();
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
            loadUsers();
          });
        }
        $scope.pageConfig.plat_user_panel.passwordModify = false;
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
        $scope.$emit(GlobalEvent.onShowLoading, true);
        UserService.getUsers($scope.pageConfig.plat_user_panel.pagination,function(err, data){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err) {
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          data.users.forEach(function(user){
            $scope.pageConfig.plat_user_panel.users.push({
              _id: user._id,
              username: user.username,
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
      function loadCardBalance(){
        CardService.getCardBalance({}, function(err, data){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err) {
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }
          $scope.pageConfig.plat_card_panel.totalCardBalance = data.total_card_balance;
          return;
        });
      }
      function loadCards(){
        $scope.pageConfig.plat_card_panel.cards = [];
        CardService.getCards($scope.pageConfig.plat_card_panel.pagination,$scope.pageConfig.plat_card_panel.keyword,function(err, data){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err) {
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }
          console.log(data);
          data.card_list.forEach(function(card){
            $scope.pageConfig.plat_card_panel.cards.push({
              _id: card._id,
              id_number:card.id_number,
              card_number: card.card_number,
              nickname: card.nickname,
              amount: card.amount,
              status: card.status,
              type: {id: card.type, text: CardService.translateCardType(card.type)},
              status_display: CardService.translateCardStatus(card.status),
              create_time:card.create_time,
              update_time:card.update_time
            });
          });

          $scope.pageConfig.plat_card_panel.pagination.totalCount = data.total_count;
          $scope.pageConfig.plat_card_panel.pagination.limit = data.limit;
          $scope.pageConfig.plat_card_panel.pagination.pageCount = Math.ceil($scope.pageConfig.plat_card_panel.pagination.totalCount / $scope.pageConfig.plat_card_panel.pagination.limit);

        });
      }
      $scope.showBatchRechargePanel = function(){
        $scope.pageConfig.popMaskShow = true;
        $scope.batchRechargeShow = true;
        $scope.batchRechargeMessage = '';
      };
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

      $scope.replaceCard = function(card){
        if(!card){
          return;
        }
        $scope.pageConfig.plat_card_panel.currentEditCard = card;
        $scope.pageConfig.scanType = 'replace_card';

        $scope.pageConfig.popMaskShow = true;
        $scope.pageConfig.addPanel = true;
        $scope.pageConfig.plat_card_panel.show_plat=true;
      };

      function parseNumber(numberString){
        var price = -1;
        try{
          price = parseFloat(numberString);
          price = isNaN(price) ? -1 : price;
          if(price < 0){
            return -1;
          }
        }catch(e){
          price = -1;
        }
        return price;
      }
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

        var addMondy = parseNumber($scope.pageConfig.plat_card_panel.add_money);
        if(addMondy < 0){
          $scope.$emit(GlobalEvent.onShowAlert, '请输入正确金额');
          return ;
        }

        var money = parseNumber($scope.pageConfig.plat_card_panel.currentEditCard.amount);
        if(money < 0){
          $scope.$emit(GlobalEvent.onShowAlert, '卡内余额解析出错！');
          return ;
        }

        param = {
          card_number: $scope.pageConfig.plat_card_panel.currentEditCard.card_number,
          id_number: $scope.pageConfig.plat_card_panel.currentEditCard.id_number,
          amount: addMondy,
          type: $scope.pageConfig.plat_card_panel.currentEditCard.type.id,
          nickname: $scope.pageConfig.plat_card_panel.currentEditCard.nickname
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
            loadCards();
          });
        }else{

          CardService.modifyCard($scope.pageConfig.plat_card_panel.currentEditCard._id,param, function(err, data){
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if (err) {
              return $scope.$emit(GlobalEvent.onShowAlert, UserError[err] || err);
            }

            $scope.pageConfig.plat_card_panel.currentEditCard.amount = 0;
            $scope.pageConfig.plat_card_panel.add_money = 0;
            clearError();
            $scope.closePopMask();
            $scope.$emit(GlobalEvent.onShowAlert, '修改成功');
            loadCards();
          });
        }
      };

      $scope.batchRechargeCard = function(){
        $scope.$emit(GlobalEvent.onShowLoading, true);
        CardService.batchRechargeCard($scope.pageConfig.plat_card_panel.batchRechargeCardAmount, function(err, data){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if(err || !data){
            $scope.$emit(GlobalEvent.onShowAlert, err || '批量充值失败');
          }

          $scope.batchRechargeMessage = '批量充值成功！成功为' + data.success_count + '人充值' + $scope.pageConfig.plat_card_panel.batchRechargeCardAmount + '元。';
          $scope.pageConfig.plat_card_panel.batchRechargeCardAmount = 0;
          loadCards();
        });
      };

      $scope.deleteCard = function(card){
        $scope.$emit(GlobalEvent.onShowAlertConfirm,
          {title: '确认操作', content: '确定要删除饭卡吗？', callback: function () {
            $scope.$emit(GlobalEvent.onShowLoading, true);
            CardService.deleteCard(card._id, function(err, card){

              $scope.$emit(GlobalEvent.onShowLoading, false);
              if(err){
                $scope.$emit(GlobalEvent.onShowAlert, err);
              }

              $scope.$emit(GlobalEvent.onShowAlert, '删除成功！');
              loadCards();
            });

        }});
      };

      $scope.closeCard = function(card){
        $scope.$emit(GlobalEvent.onShowAlertConfirm,
          {title: '确认操作', content: '卡内余额为:'+ card.amount +'，确定要退饭卡吗？', callback: function () {

            $scope.$emit(GlobalEvent.onShowLoading, true);
            CardService.closeCard(card._id, function(err, data){
              $scope.$emit(GlobalEvent.onShowLoading, false);
              if(err || !data){
                $scope.$emit(GlobalEvent.onShowAlert, err);
              }

              $scope.$emit(GlobalEvent.onShowAlert, '退卡成功！');
              loadCards();
            });
          }});
      };

      $scope.changeCardStatus = function(card){
        $scope.$emit(GlobalEvent.onShowLoading, true);
        if(card.status !== 'frozen'){
          CardService.freezeCard(card._id, function(err, data){
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if(err || !data){
              $scope.$emit(GlobalEvent.onShowAlert, err);
            }

            $scope.$emit(GlobalEvent.onShowAlert, '您的饭卡已挂失！');
            loadCards();
          });
        }else{
          CardService.cancelFreezeCard(card._id, function(err, data){
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if(err || !data){
              $scope.$emit(GlobalEvent.onShowAlert, err);
            }

            $scope.$emit(GlobalEvent.onShowAlert, '您的饭卡已重新开启！');
            loadCards();
          });
        }
      };

      $scope.saveReplaceCard = function(){
        if(!$scope.pageConfig.plat_card_panel.new_card_number){
          return $scope.$emit(GlobalEvent.onShowAlert, '请输入新的卡号！');
        }
        $scope.$emit(GlobalEvent.onShowLoading, true);
        CardService.replaceCard($scope.pageConfig.plat_card_panel.currentEditCard._id,
          $scope.pageConfig.plat_card_panel.new_card_number,
          function(err, data){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if(err || !data){
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          $scope.$emit(GlobalEvent.onShowAlert, '补卡成功！');

          clearError();
          $scope.closePopMask();
            loadCards();
        });
      };

      $scope.searchCards=function(){
        loadCards();
      };

      $scope.myKeyup = function(e){
        var keycode = window.event?e.keyCode:e.which;
        if(keycode===13){
          $scope.searchCards();
        }
      };

      function getNewCardObj(){
        return {
          card_number: '',
          id_number: '',
          amount: 0,
          type: {id: 'normal', text: CardService.translateCardType('normal')},
          nickname:''
        };
      }
      function validCardInfo(card) {
        var isPassed = true;
        if (!card.card_number) {
          $scope.pageConfig.plat_card_panel.errorInfo.card_number = true;
          isPassed = false;
        }

        if (!card.id_number) {
          $scope.pageConfig.plat_card_panel.errorInfo.id_number = true;
          isPassed = false;
        }

        if(!card.type){
          $scope.pageConfig.plat_card_panel.errorInfo.type = true;
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
        }else if($scope.user.role === 'admin'){
          $scope.pageConfig.currentTag = 'platform-user';
        }else{
          $scope.pageConfig.currentTag = 'card-user';
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

          if($scope.user.role === 'admin'){
            loadUsers();
            loadClients();
            loadCardBalance();
          }
          loadCards();
        });
      }
      init();

      $scope.goState = function(state){
        if(state){
          $state.go(state);
        }
      };
    }]);
