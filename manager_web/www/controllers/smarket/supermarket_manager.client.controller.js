/**
 * Created by wxc on 16/04/17.
 */

'use strict';
angular.module('EWeb').controller('SMarketManagerController',
['$window', '$rootScope', '$scope', 'GlobalEvent', '$state', 'UserService',
'UserError',
function ($window, $rootScope, $scope, GlobalEvent, $state, UserService, UserError){
  $scope.pageConfig.text = '超市管理';
  $scope.pageConfig.currentTableIndex = 0;
  $scope.pageConfig.goBack = function () {
    $window.history.back();
  };
  $scope.pageConfig.selectedTable = function (index) {
    $scope.pageConfig.currentTableIndex = index;
    var len = $scope.pageConfig.tables.length;
  };
  $scope.pageConfig.tables = [{ // user table
    id: 1,
    showStr:{
      name: '平台用户',
      add: '添加用户'
    },
    cols:[{
      id: 'username',
      cla: 'col-xs-2',
      text: '用户名'
    }, {
      id: 'nickname',
      cla: 'col-xs-2',
      text: '昵称'
    }, {
      id: 'mobile_phone',
      cla: 'col-xs-2',
      text: '电话'
    }, {
      id: 'role.text',
      cla: 'col-xs-1',
      text: '角色'
    }, {
      id: 'sex.text',
      cla: 'col-xs-1',
      text: '性别'
    }, {
      id: 'group.text',
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
      role: {
        text: '普通用户'
      },
      sex: {
        text: '男'
      },
      group: {
        text: '医生'
      }
    }, {
      username: 'wang',
      nickname: 'xiao',
      mobile_phone: '12345678901',
      role: {
        text: '普通用户'
      },
      sex: {
        text: '男'
      },
      group: {
        text: '医生'
      }
    }],
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
      id: 'role.text',
      cla: 'col-xs-1',
      text: '角色'
    }, {
      id: 'group.text',
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
