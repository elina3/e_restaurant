/**
 * Created by louisha on 15/12/29.
 */
var userAgent = navigator.userAgent.toLowerCase();

function getServerAddress(){
    return window.location.protocol + '//' + window.location.host;
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

function amountParse(numberString) {
    var amount = -1;
    try {
        amount = parseFloat(numberString);
        amount = isNaN(amount) ? -1 : amount;
        if (amount < 0) {
            amount = -1;
        }
    } catch (e) {
        amount = -1;
    }
    return amount;
}