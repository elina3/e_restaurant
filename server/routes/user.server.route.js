/**
 * Created by elinaguo on 16/2/26.
 */
'use strict';

var userController = require('../controllers/user');

module.exports = function (app) {
  app.route('/user_groups').get(userController.getGroups);
  app.route('/user/sign_in').post(userController.signIn);
  app.route('/user/sign_up').post(userController.signUp);
};
