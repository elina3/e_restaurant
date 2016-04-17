/**
 * Created by elina on 15/9/7.
 */

'use strict';

angular.module('EClientWeb').factory('ResourcesService',
    ['Config',
        function (Config) {
            return {
                getImageUrl: function (imgName, type) {
                    if(imgName){
                        return Config.qiniuServerAddress + '/' + imgName;
                    }
                    return '';
                }
            };
        }]);
