/**
 * Created by elinaguo on 16/2/25.
 */
'use strict';

exports.signIn = function(req, res, next){
  var code = req.body.code || req.query.code || '';
  var username = req.body.username || req.query.username || '';
  var password = req.body.password || req.query.password || '';

};

exports.signUp = function(req, res, next){
  var username = req.body.username || req.query.username || '';
  var password = req.body.password || req.query.password || '';

};
