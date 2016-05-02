/**
 * Created by elinaguo on 16/5/2.
 */
'use strict';
angular.module('EClientWeb').directive('eImage', [
  'Config',
  function (Config) {
    return {
      restrict: 'EA',
      templateUrl: 'directives/e_image/e_image.client.directive.html',
      replace: true,
      scope: {
        imageKey: '='
      },
      link: function (scope, element, attributes) {
        scope.generateStyle = function () {
          if(!scope.imageKey ){
            return;
          }
          return {
            'background': 'url(' + Config.qiniuServerAddress + scope.imageKey + ') no-repeat center top',
            'background-size': 'cover'
          };
        };
      }
    };
  }]);