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

console.log('========================JDEMO Server=====================');
console.log('JDEMO Server!');
console.log('enviroment:', process.env.NODE_ENV);

console.log('JDEMO application started on address ' + config.serverAddress);
console.log('JDEMO application started on port ' + config.port);



