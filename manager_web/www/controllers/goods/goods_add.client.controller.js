/**
 * Created by elinaguo on 16/4/16.
 */

'use strict';
angular.module('EWeb').controller('GoodsAddController',
  ['$scope', '$stateParams', '$window', '$rootScope',  'GlobalEvent', '$state', 'GoodsService', 'QiNiuService', 'Config',
    function ($scope, $stateParams, $window, $rootScope, GlobalEvent, $state, GoodsService, QiNiuService, Config) {

      $scope.pageData = {
        qiniuToken: '',
        photos: []
      };

      function init(){
        $scope.$emit(GlobalEvent.onShowLoading, true);
        QiNiuService.qiNiuKey(function(err, data){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if(err){
            console.log(err);
            return;
          }

          console.log(data);
          $scope.pageData.qiniuToken = data.token;
        });
      }

      init();

      function generalImgUrl(imgName) {
        return Config.qiniuServerAddress + imgName;
      }

      function start(index, target) {
        target[index].progress = {
          p: 0
        };
        target[index].upload = QiNiuService.upload({
          file: target[index].file,
          token: $scope.pageData.qiniuToken
        });
        target[index].upload.then(function (response) {
          target[index].img = generalImgUrl(response.key);
          target[index].photo_key = response.key;
        }, function (response) {
          alert(response);
          console.log(response);
        }, function (evt) {
          target[index].progress.p = Math.floor(100 * evt.loaded / evt.totalSize);
        });
      }

      $scope.onFileSelect = function ($files, target) {
        var offsetx = target.length;
        for (var i = 0; i < $files.length; i++) {
          target[i + offsetx] = {
            file: $files[i]
          };
          start(i + offsetx, target);
        }
      };

      $scope.abort = function (index, target) {
        if (target[index].upload) {
          //待修改的，非上传图片属性不会有这个属性
          target[index].upload.abort();
        }
        target.splice(index, 1);
      };
    }]);
