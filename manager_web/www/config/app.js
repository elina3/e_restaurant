'use strict';
/**
 * Created by louisha on 15/9/24.
 */
var eWeb = angular.module('EWeb', [
    'ui.router',
    'ngAnimate',
    'ngMessages',
    'LocalStorageModule',
    'base64',
    'daterangepicker'
]);

eWeb.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      //.state('goods_list', {
      //    url: '/goods_list',
      //    templateUrl: '/templates/goods/goods_list.client.view.html',
      //    controller: 'GoodsListController'
      //})
      //.state('user_sign_up', {
      //    url: '/user/sign_up',
      //    templateUrl: 'templates/user/sign_up.client.view.html',
      //    controller: 'UserSignUpController'
      //})
      .state('user_sign_in', {
          url: '/user/sign_in',
          templateUrl: 'templates/user/sign_in.client.view.html',
          controller: 'UserSignInController'
      })
      .state('goods_manager', {
          url: '/good/manager:goods_type',
          templateUrl: 'templates/goods/goods_manager.client.view.html',
          controller: 'GoodsManagerController'
      })
      .state('goods_order', {
        url: '/goods/orders:filter',
        templateUrl: 'templates/goods/goods_order.client.view.html',
        controller: 'GoodsOrderController'
      })
      .state('order_statistic', {
        url: '/orders/statistics:filter',
        templateUrl: 'templates/goods/order_statistic.client.view.html',
        controller: 'OrderStatisticController'
      })
      .state('goods_add', {
        url: '/goods/add',
        templateUrl: 'templates/goods/goods_add.client.view.html',
        controller: 'GoodsAddController'
      })
      .state('user_manager', {
          url: '/user/manager:panel_type',
          templateUrl: 'templates/user/user_manager.client.view.html',
          controller: 'UserManagerController'
      })
      .state('user_index', {
        url: '/user/index',
        templateUrl: 'templates/user/user_index.client.view.html',
        controller: 'UserIndexController'
      })
      .state('card_history', {
        url: '/user/card/history',
        templateUrl: 'templates/user/card_history.client.view.html',
        controller: 'CardHistoryController'
      })
      .state('card_statistic', {
        url: '/user/card/statistic',
        templateUrl: 'templates/user/card_statistic.client.view.html',
        controller: 'CardStatisticController'
      })
      .state('smarket_manager', {
        url: '/supermarket/manager',
        templateUrl: 'templates/supermarket/supermarket_manager.client.view.html',
        controller: 'SMarketManagerController'
      })
      .state('set_meal', {
        url: '/healthy_meal/set_meal',
        templateUrl: 'templates/healthy_meal/set_meal.client.view.html',
        controller: 'SetMealController'
      })
      .state('hospitalized_info', {
        url: '/healthy_meal/hospitalized_info',
        templateUrl: 'templates/healthy_meal/hospitalized_info.client.view.html',
        controller: 'HospitalizedInfoController'
      })
      .state('bed_meal_bill', {
        url: '/healthy_meal/bed_meal_bill',
        templateUrl: 'templates/healthy_meal/bed_meal_bill.client.view.html',
        controller: 'BedMealBillController'
      });

    $urlRouterProvider.otherwise('/user/sign_in');
}]);

eWeb.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('PublicInterceptor');

    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    /**
     * The workhorse; converts an object to x-www-form-urlencoded serialization.
     * @param {Object} obj
     * @return {String}
     */
    var param = function (obj) {
        var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
        for (name in obj) {
            value = obj[name];

            if (value instanceof Array) {
                for (i = 0; i < value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if (value instanceof Object) {
                for (subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if (value !== undefined && value !== null)
                query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }
        return query.length ? query.substr(0, query.length - 1) : query;
    };

    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [function (data) {
        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];
}]);
