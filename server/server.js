'use strict';
/**
 * Module dependencies.
 */
var  init = require('./config/init')(),
  config = require('./config/config');

// Init the express application
var app = require('./config/express')(config);

// Start the app by listening on <port>
app.listen(config.port);

// Expose app
exports = module.exports = app;

console.log('========================ERestaurant Server=====================');
console.log('ERestaurant Server!');
console.log('enviroment:', process.env.NODE_ENV);

console.log('ERestaurant application started on address ' + config.serverAddress);
console.log('ERestaurant application started on port ' + config.port);

console.log('init default data');
//var initData = require('./config/initData');
//initData.createDefaultGroup();



