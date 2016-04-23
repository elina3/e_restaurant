/**
 * Created by wxc on 16/04/17.
 */

'use strict';
angular.module('EWeb').controller('SMarketManagerController',
['$window', '$rootScope', '$scope', 'GlobalEvent', '$state', 'UserService',
'UserError',
function ($window, $rootScope, $scope, GlobalEvent, $state, UserService, UserError){
  $scope.pageConfig.text = '超市管理';
  $scope.pageConfig.currentTableIndex = 0; // show the selected table, default show the table of the index is 0.
  $scope.pageConfig.goBack = function () {
    $window.history.back();
  };
  $scope.pageConfig.selectedTable = function (index) {
    $scope.pageConfig.currentTableIndex = index;
  };
  $scope.popupConfig = {}; // fixed bug: use strict, so must define it before used.
  $scope.popupConfig.type = 0; // 1 - add, 2 - delete, 3 - edit, 4 - scan, 0 - hidden.
  $scope.popupConfig.text = '';
  $scope.popupConfig.closePopMask = function(){
    $scope.popupConfig.type = 0;
  };
  $scope.popupConfig.data = {};
  $scope.popupConfig.reset = null;
  $scope.popupConfig.cancel = null;
  $scope.popupConfig.submit = null; // 提交
  $scope.pageConfig.tables = [{ // user table
    id: 1,
    showStr:{
      name: '平台用户',
      add: '添加用户'
    },
    cols:[{ // the columns needed to show in the table.
      id: 'username', // data property.
      cla: 'col-xs-2', // css type.
      text: '用户名' // title string.
    }, {
      id: 'nickname',
      cla: 'col-xs-2',
      text: '昵称'
    }, {
      id: 'mobile_phone',
      cla: 'col-xs-2',
      text: '电话'
    }, {
      id: 'roleText',
      cla: 'col-xs-1',
      text: '角色'
    }, {
      id: 'sexText',
      cla: 'col-xs-1',
      text: '性别'
    }, {
      id: 'groupText',
      cla: 'col-xs-2',
      text: '组别'
    }, {
      id: '',
      cla: 'col-xs-2',
      text: '操作'
    }],
    data: [{
      username: 'wang',
      nickname: 'xiao',
      mobile_phone: '12345678901',
      roleText: '普通用户',
      sexText: '男',
      groupText: '医生'
    }, {
      username: 'wang',
      nickname: 'xiao',
      mobile_phone: '12345678901',
      roleText: '普通用户',
      sexText: '男',
      groupText: '医生'
    }],
    addRecord: function(){
      $scope.popupConfig.type = 1;
      $scope.popupConfig.text = '增加用户';
      $scope.popupConfig.data = {};
      function callbackSubmit(){
        console.log( 'wxc: submit add: ' + $scope.popupConfig.data );
      }
      function callbackCancel(){
        $scope.popupConfig.closePopMask();
        console.log( 'wxc: cancel add: ' + $scope.popupConfig.data );
      }
      function callbackReset(){
        $scope.popupConfig.data = {};
        console.log( 'wxc: reset add: ' + $scope.popupConfig.data );
      }
      $scope.popupConfig.submit = callbackSubmit;
      $scope.popupConfig.cancel = callbackCancel;
      $scope.popupConfig.reset = callbackReset;
      console.log( 'wxc: add record ' + this.id );
    },
    deleteRecord: function( record ){
      $scope.popupConfig.type = 2;
      $scope.popupConfig.text = record.nickname;
      console.log( 'wxc: delete record ' + this.id + ' ' + record );
    },
    editRecord: function( record ){
      $scope.popupConfig.type = 3;
      $scope.popupConfig.text = record.nickname;
      console.log( 'wxc: edit record ' + this.id + ' ' + record );
    },
    scanRecord: function( record ){
      $scope.popupConfig.type = 4;
      $scope.popupConfig.text = record.nickname;
      $scope.popupConfig.data = record;
      console.log( 'wxc: scan record ' + this.id + ' ' + record );
    }
  }, { // table 2
    id: 2,
    showStr:{
      name: '客户端用户',
      add: '添加客户端用户'
    },
    cols:[{
      id: 'username',
      cla: 'col-xs-2',
      text: '用户名'
    }, {
      id: 'nickname',
      cla: 'col-xs-2',
      text: '用户名'
    }, {
      id: 'roleText',
      cla: 'col-xs-1',
      text: '角色'
    }, {
      id: 'groupText',
      cla: 'col-xs-2',
      text: '用户名'
    }, {
      id: '',
      cla: 'col-xs-2',
      text: '操作'
    }],
    data: [],
    addRecord: function () {
      console.log( 'wxc: add record ' + this.id );
    },
    deleteRecord: function (record) {
      console.log( 'wxc: delete record ' + this.id + ' ' + record );
    },
    editRecord: function(record){
      console.log( 'wxc: edit record ' + this.id + ' ' + record );
    },
    scanRecord: function (record) {
      console.log( 'wxc: scan record ' + this.id + ' ' + record );
    }
  }, { // table 3
    id: 3,
    showStr:{
      name: '饭卡',
      add: '添加饭卡'
    },
    cols:[{
      id: 'username',
      cla: 'col-xs-2',
      text: '用户名'
    }, {
      id: 'username',
      cla: 'col-xs-2',
      text: '用户名'
    }, {
      id: 'username',
      cla: 'col-xs-1',
      text: '角色'
    }, {
      id: 'username',
      cla: 'col-xs-2',
      text: '用户名'
    }, {
      id: '',
      cla: 'col-xs-2',
      text: '操作'
    }],
    data: [],
    addRecord: function () {
      console.log( 'wxc: add record ' + this.id );
    },
    deleteRecord: function (record) {
      console.log( 'wxc: delete record ' + this.id + ' ' + record );
    },
    editRecord: function(record){
      console.log( 'wxc: edit record ' + this.id + ' ' + record );
    },
    scanRecord: function (record) {
      console.log( 'wxc: scan record ' + this.id + ' ' + record );
    }
  }];
}]);
