/**
 * Created by louisha on 15/12/29.
 */
var userAgent = navigator.userAgent.toLowerCase();

function getServerAddress(){
    return 'https://' + window.location.host;
}

function getCurrentDevice(){
    if (/iphone|ipad|ipod/.test(userAgent)) {
        return 'ios';
    } else if (/android/.test(userAgent)) {
        return 'android';
    } else {
        return 'web';
    }
}

function isWechatBroswer(){
    var matchResult = userAgent.match(/MicroMessenger/i);
    if(matchResult){
        return matchResult.toString() === 'micromessenger';
    }else{
        return false;
    }
}
