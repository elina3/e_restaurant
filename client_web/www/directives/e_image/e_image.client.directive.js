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
        imageKey: '=',
        notQiniu: '='
      },
      link: function (scope, element, attributes) {
        scope.generateStyle = function () {
          if(!scope.imageKey ){
            return {
              'background': 'url("../../resources/free_meal_default.jpg") no-repeat center top',
              'background-size': 'cover'
            };
          }
          if(scope.notQiniu === 'yes'){
            return {
              'background': 'url(' + scope.imageKey + ') no-repeat center top',
              'background-size': 'cover'
            };
          }
          return {
            'background': 'url(' + Config.qiniuServerAddress + scope.imageKey + ') no-repeat center top',
            'background-size': 'cover'
          };
        };
      }
    };
  }]);