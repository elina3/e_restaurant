/**
 * Created by louisha on 15/12/29.
 */
'use strict';
$(function(){
    downLoadController();
});

function downLoadController(){

    var androidDownloadUrl= getServerAddress() + '/app/download/android';
    var device = getCurrentDevice();

    var element = {
        downloadButton: $('.download-btn'),
        mask: $('.mask')
    };

    element.mask.click(function(){
        element.mask.hide();
    });

    element.downloadButton.click(function () {
        if (isWechatBroswer()) {
            element.mask.show();
            return;
        }

        if(device === 'android'){
            window.location.href = androidDownloadUrl;
        }else if(device === 'ios'){
            //ios
            //window.location.href = 'itms-apps://itunes.apple.com/cn/app/lin-lin-pei-song/id1022199731?mt=8';
        }else{
            //web
            window.location.href = androidDownloadUrl;
        }


    });
}
