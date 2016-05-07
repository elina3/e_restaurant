/**
 * Created by zenghong on 16/4/21.
 */
'use strict';

angular.module('EWeb').directive('dialogConfirmBox', ['$rootScope', 'GlobalEvent', function ($rootScope, GlobalEvent) {
  return {
    restrict: 'E',
    templateUrl: 'directives/dialog_confirm_box/dialog_confirm_box.client.view.html',
    replace: true,
    scope: {},
    controller: function ($scope, $element) {
      $scope.dialogInfo = {
        title: '',
        type: '',
        content: '',
        sureLabel: '',
        cancelLabel: '',
        subTitle: '',
        icon: '',
        isShow: false,
        callback: null
      };

      function show() {
        $scope.dialogInfo.isShow = true;
      }

      function hide() {
        $scope.dialogInfo.isShow = false;
        $scope.dialogInfo.callback = null;
      }

      $scope.sure = function () {
        if ($scope.dialogInfo.callback) {
          $scope.dialogInfo.callback();
        }
        hide();
      };

      $scope.cancel = function () {
        hide();
      };

      $rootScope.$on(GlobalEvent.onShowAlertConfirm, function (event, data) {
        $scope.dialogInfo.title = data.title || '确认消息';
        $scope.dialogInfo.subTitle = data.subTitle || '';
        $scope.dialogInfo.content = data.content || '';
        $scope.dialogInfo.sureLabel = data.sureLabel || '确认';
        $scope.dialogInfo.cancelLabel = data.cancelLabel || '取消';
        $scope.dialogInfo.icon = data.icon || '';
        $scope.dialogInfo.callback = data.callback;

        show();
      });

    }
  };
}]);
