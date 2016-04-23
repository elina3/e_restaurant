'use strict';
/**
 * Created by elina on 15/9/24.
 */
var eClientWeb = angular.module('EClientWeb', [
    'ui.router',
    'ngAnimate',
    'ngMessages',
    'LocalStorageModule'
]);

eClientWeb.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('/', {
          url: '/',
          templateUrl: 'views/home.client.view.html',
          controller: 'HomeController'
      })
      .state('goods_detail', {
          url: '/goods/detail:goods_id',
          templateUrl: 'views/goods_detail.client.view.html',
          controller: 'GoodsDetailController'
      })
      .state('free_meal', {
          url: '/goods/free_meal',
          templateUrl: 'views/free_meal.client.view.html',
          controller: 'FreeMealController'
      })
      .state('my_cart', {
          url: '/goods/my_cart',
          templateUrl: 'views/my_cart.client.view.html',
          controller: 'MyCartController'
      })
      .state('my_orders', {
          url: '/orders/mine',
          templateUrl: 'views/my_orders.client.view.html',
          controller: 'MyOrdersController'
      })
      .state('order_detail', {
          url: '/orders/:order_id/:goods_infos',
          templateUrl: 'views/order_detail.client.view.html',
          controller: 'OrderDetailController'
      })
      .state('payment', {
          url: '/payment/:order_id',
          templateUrl: 'views/payment.client.view.html',
          controller: 'PaymentController'
      })
      .state('sign_in', {
          url: '/client/sign_in',
          templateUrl: 'views/sign_in.client.view.html',
          controller: 'SignInController'
      })
    .state('log', {
        url: '/log',
        templateUrl: 'views/log.client.view.html',
        controller: 'LogController'
    });

    $urlRouterProvider.otherwise('/');
}]);

eClientWeb.config(['$httpProvider', function ($httpProvider) {
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

Date.prototype.Format = function (fmt) {
    /// <summary>
    /// 对Date的扩展，将 Date 转化为指定格式的String
    /// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
    /// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
    /// 例子：
    /// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
    /// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
    /// </summary>
    /// <param name="fmt"></param>
    /// <returns type=""></returns>
    var o = {
        'M+': this.getMonth() + 1,                 //月份
        'd+': this.getDate(),                    //日
        'h+': this.getHours(),                   //小时
        'm+': this.getMinutes(),                 //分
        's+': this.getSeconds(),                 //秒
        'q+': Math.floor((this.getMonth() + 3) / 3), //季度
        'S': this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp('(' + k + ')').test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    return fmt;
};

