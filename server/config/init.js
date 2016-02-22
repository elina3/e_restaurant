'use strict';

/**
 * Module dependencies.
 */
var glob = require('glob');

module.exports = function() {
    /**
     * Before we begin, lets set the environment variable
     * We'll Look for a valid NODE_ENV variable and if one cannot be found load the development NODE_ENV
     */
    glob('./config/env/' + process.env.NODE_ENV + '.js', {
        sync: true
    }, function(err, environmentFiles) {
        if (!environmentFiles.length) {
            if (process.env.NODE_ENV) {
                console.error('\x1b[31m', 'No configuration file found for "' + process.env.NODE_ENV + '" environment using development instead');
            } else {
                console.error('\x1b[31m', 'NODE_ENV is not defined! Using default development environment');
            }

            process.env.NODE_ENV = 'development';
        } else {
            console.log('\x1b[7m', 'Application loaded using the "' + process.env.NODE_ENV + '" environment configuration');
        }
        console.log('\x1b[0m');
    });

    /**
     * Add our server node extensions
     */

    require.extensions['.server.library.js'] = require.extensions['.js'];
    require.extensions['.server.global.js'] = require.extensions['.js'];
    require.extensions['.server.model.js'] = require.extensions['.js'];
    require.extensions['.server.route.js'] = require.extensions['.js'];
    require.extensions['.server.validator.js'] = require.extensions['.js'];
    require.extensions['.server.service.js'] = require.extensions['.js'];
    require.extensions['.server.job.js'] = require.extensions['.js'];
    require.extensions['.server.error.js'] = require.extensions['.js'];
    require.extensions['.server.filter.js'] = require.extensions['.js'];
    require.extensions['.server.logic.js'] = require.extensions['.js'];
    require.extensions['.server.controller.js'] = require.extensions['.js'];
    require.extensions['.server.enum.js'] = require.extensions['.js'];
    require.extensions['.server.test.support.js'] = require.extensions['.js']; //Unit Test Support
};
