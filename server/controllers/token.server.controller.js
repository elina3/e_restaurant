'use strict';

var cryptoLib = require('../libraries/crypto'),
    qiniu = require('../libraries/qiniu');

exports.uploadToken = function (req, res, next) {
    var token = new qiniu.rs.PutPolicy('z-test').token();
    res.send({token: token});
};
