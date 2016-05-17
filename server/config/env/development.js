'use strict';

module.exports = {
    appDb: 'mongodb://localhost/e-restaurant-dev',
    app: {
        title: 'ERestaurant - Development Environment'
    },
    serverAddress:'http://localhost:7008/',
    port: process.env.PORT || 7008
};
