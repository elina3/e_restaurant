'use strict';

var request = require('request');
// 连接超时时间
var TIMEOUT = 30000,
fs = require('fs');

var httpManager = {
    /**
     *  HTTP POST请求，返回JSON数据格式
     * @param host
     * @param postData
     * @param headers
     * @param callback
     * @return json数据
     */
    post: function (host, postData, callback) {

        var headers = {
            'User-Agent': 'request',
            'Content-Type': 'Content-Type:application/x-www-form-urlencoded',
            'json': true,
            'accept': 'application/json'
        };

        var options = {
            url:host,
            form: postData,
            json: true,
            headers: headers
        };

        request.post(options, function(err,res,data){
            if (!err && res.statusCode == 200) {
                if(data.err){
                    return callback(data);
                }

                return callback(null, data);
            }

            return callback(err, data);
        });
    },
    get: function(host, queryData, headers, callback){
        var options = {
            uri: host,
            form: queryData,
            json: true,
            method: 'get',
            timeout: TIMEOUT,
          headers :  {
              'Content-Type': 'Content-Type:application/x-www-form-urlencoded',
              'json': true,
              'accept': 'application/json'
          }
        };
        if(headers){
            options.headers = headers;
        }
        request(options, function (err, res, data) {
            if (!err && res.statusCode == 200) {
                if(data.err){
                    return callback(data.err);
                }
                return callback(null, data);
            }

            return callback(err, data);
        });
    }
};

module.exports = httpManager;
