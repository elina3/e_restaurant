/**
 * Created by elinaguo on 16/3/18.
 */
'use strict';

module.exports = {
  appDb: 'mongodb://localhost/e-restaurant-dev',
  app: {
    title: 'ERestaurant - Production Environment'
  },
  serverAddress:'https://localhost:7008/',
  port: process.env.PORT || 7008
};
