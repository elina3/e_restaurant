/**
 * Created by elinaguo on 16/5/3.
 */
'use strict';
var baiduApiController = require('../controllers/baidu_api');

module.exports = function (app) {
  app.route('/baidu/api/token').post(baiduApiController.getBaiduToken);
  app.route('/baidu/api/audio/merge').get(baiduApiController.audioMerge);
};
