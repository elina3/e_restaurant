'use strict';

/**
 * Module dependencies.
 */
var express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  compress = require('compression'),
  methodOverride = require('method-override'),
  helmet = require('helmet'),
  config = require('./config'),
  path = require('path'),
  ejs = require('ejs'),
  async = require('async'),
  mongoose = require('mongoose');




module.exports = function () {
  // Initialize express app
  var app = express();
  app.engine('.html', ejs.__express);
  app.set('view engine', 'html');


  // Globbing model files
  config.getGlobbedFiles('./models/**/*.js').forEach(function (modelPath) {
    require(path.resolve(modelPath));
  });

  // Passing the request url to environment locals
  app.use(function (req, res, next) {
    next();
  });

  // Should be placed before express.static
  app.use(compress({
    filter: function (req, res) {
      return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
    },
    level: 9
  }));

  // Showing stack errors
  app.set('showStackError', true);

  // Environment dependent middleware
  if (process.env.NODE_ENV === 'development') {
    // Enable logger (morgan)
    app.use(morgan('dev'));

    // Disable views cache
    app.set('view cache', false);
  }

  // Request body parsing middleware should be above methodOverride
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(methodOverride());

  // Enable jsonp
  app.enable('jsonp callback');

  // Use helmet to secure Express headers
  //app.use(helmet.xframe());
  app.use(helmet.xssFilter());
  app.use(helmet.nosniff());
  app.use(helmet.ienoopen());
  app.disable('x-powered-by');

  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  // Setting the app router and static folder
  app.use('/', express.static(path.resolve('../web')));
  app.use(function (req, res, next) {

    // Environment dependent middleware
    if (process.env.NODE_ENV !== 'test') {
      console.log(new Date().toLocaleString() + ' : ' + req.path + JSON.stringify(req.body));
      console.log(new Date().toLocaleString() + ' : ' + req.path + JSON.stringify(req.query));
    }

    if (req.path.slice(-1) === '/' && req.path.length > 1) {
      res.status(404).json({
        error: {
          type: 'invalid_request_error',
          message: 'Unrecognized request URL (' +
          req.method + ': ' + req.originalUrl + ').'
        }
      });
    } else {
      next();
    }
  });

  // Globbing routing files
  config.getGlobbedFiles('./routes/**/*.js').forEach(function (routePath) {
    require(path.resolve(routePath))(app);
  });

  // Assume 'not found' in the error msgs is a 500. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
  app.use(function (err, req, res, next) {
    async.auto({
      RecordError: function (callback) {
        if (req.err) {
          return callback(req.err);
        }
        else {
          return callback();
        }
      },
      GetData: function (callback, results) {
        if (req.data) {
          return callback(null, req.data);
        } else {
          return callback();
        }
      }
    }, function (error, results) {
      if (error)
        return res.send(error);

      if (results.GetData)
        return res.send(results.GetData);

      // If the error object doesn't exists
      if (!err) return next();
    });
  });

  // Assume 404 since no middleware responded
  app.use(function (req, res, next) {
    async.auto({
      RecordError: function (callback) {
        if (req.err) {
          return callback(req.err);
        }
        else {
          return callback();
        }
      },
      GetData: function (callback, results) {
        if (req.data) {
          return callback(null, req.data);
        } else {
          return callback();
        }
      }
    }, function (error, results) {
      if (error)
        return res.send(error);

      if (results.GetData)
        return res.send(results.GetData);

      res.status(404).json({
        error: {
          type: 'invalid_request_error',
          message: 'Unrecognized request URL (' +
          req.method + ': ' + req.originalUrl + ').'
        }
      });
    });
  });

  return app;
};


