'use strict';
/**
 * Created by louisha on 15/5/24.
 */
angular.module('EWeb').directive('zzLoading', function () {
  return {
    restrict: 'EA',
    template: '<div class="zz-loading-layer" ng-if="showLoading">' +
    '<div class="zz-loading-info"> ' +
    '<img ng-src="../../images/global/load.gif"/>' +
    ' </div> </div>',
    replace: true
  };
});