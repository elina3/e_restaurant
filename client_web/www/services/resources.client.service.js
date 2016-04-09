/**
 * Created by elina on 15/9/7.
 */

'use strict';

angular.module('EClientWeb').factory('ResourcesService',
    ['Config',
        function (Config) {
            return {
                getImageUrl: function (imgName, type) {
                    return Config.serverAddress + '/temp/goods1.jpg';
                    //return Config.qiniuServerAddress + imgName;
                }
            };
        }]);
