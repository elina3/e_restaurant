'use strict';

module.exports = {
    appDb: 'mongodb://localhost/e-restaurant-dev',
    app: {
        title: 'ERestaurant - Development Environment'
    },
    serverAddress:'http://localhost:2003/',
    port: process.env.PORT || 2003
};
