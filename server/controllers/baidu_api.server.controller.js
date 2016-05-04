/**
 * Created by elinaguo on 16/5/3.
 */
'use strict';
var httpManager = require('../libraries/http_manager');
var apiKey = '8VhfNCzQiG8qNGsXDzRdHxZh';
var secretKey = '297fb15eb015cd4900b0a9ee790e9348';
var tokenUrl = 'https://openapi.baidu.com/oauth/2.0/token';
var authUrl = 'http://tsn.baidu.com/text2audio';
var macService = require('getmac');//获取mac地址


exports.getBaiduToken = function (req, res, next) {

  var url = tokenUrl + '?grant_type=client_credentials&client_id=' + apiKey + '&client_secret=' + secretKey;
  httpManager.post(url, {}, function (err, result) {
    if (err) {
      console.error(err);
      return next(err);
    }

    req.data = {
      token_info: result
    };
    return next();
  });
};

exports.audioMerge = function(req, res, next){
  //获取机器mac地址
  macService.getMac(function(err,macAddress){
    if (err){
      next(err);
    }

    console.log('MAC:');
    console.log(macAddress);
    var access_token = '24.3b490ea136ca86805cf4141af3e40f4b.2592000.1464875661.282335-8081743';
    var postData = {
      tex: '请告诉我你的性别',
      lan: 'zh',
      tok: access_token,
      ctp: 1,
      cuid: macAddress
    };

    httpManager.post(authUrl, postData, function (err, result) {

      if (err || result.err_no) {
        var errMessage = '';
        if(result.err_no){
          switch (result.err_no){
            case 500:
              errMessage = '不支持输入';
              break;
            case 501:
              errMessage = '输入参数不正确';
              break;
            case 502:
              errMessage = 'token验证失败';
              break;
            case 503:
              errMessage = '合成后端错误';
              break;
          }

          err = {
            type: 'auto_merge_failed',
            message: result.err_msg,
            zh_message: errMessage,
            err_no: result.err_no
          };
        }

        return next(err);
      }
      console.log(result);
      return res.send(result);
    });
  });
};
