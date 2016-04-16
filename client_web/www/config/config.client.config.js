/**
 * Created by louisha on 15/10/10.
 */

'use strict';

angular.module('EClientWeb').constant('Config', {
    serverAddress: 'http://' + window.location.host,
    managerServerAddress: 'http://' + window.location.host + '/manager',
    //serverAddress: 'https://zhuzhu1688.com',
    //serverAddress: 'https://agilepops.com',
    qiniuServerAddress: 'https://dn-agilepops.qbox.me'
});
