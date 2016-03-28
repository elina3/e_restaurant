/**
 * Created by elinaguo on 16/3/18.
 */
'use strict';

module.exports = {
  appDb: 'mongodb://localhost/e-restaurant-dev',
  app: {
    title: 'ERestaurant - Production Test Environment'
  },
  serverAddress:'https://localhost:2003/',
  port: process.env.PORT || 2003
};
