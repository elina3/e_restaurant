/**
 * Created by elinaguo on 16/3/30.
 */

'use strict';
angular.module('EWeb').factory('GoodsService',
  ['Auth', 'RequestSupport', 'SystemError',
    function (Auth, RequestSupport, SystemError) {
      return {
        getGoodsList: function(param, callback){
          RequestSupport.executeGet('/goods_list', {
            current_page: param.currentPage,
            limit: param.limit,
            skip_count: param.skipCount
          })
            .then(function (data) {
              if (!callback) {
                return data;
              }

              if (data.err) {
                return callback(data.zh_message || data.err);
              }

              callback(null, data);
            },
            function (err) {
              return callback(SystemError.network_error);
            });
        },
        createGoods: function (param, callback) {
          RequestSupport.executePost('/goods', {
            goods_info: param
          })
            .then(function (data) {
              if (!callback) {
                return data;
              }
              else {
                if (data.err) {
                  return callback(data.err);
                }

                callback(null, data);
              }
            },
            function (err) {
              return callback(SystemError.network_error);
            });
        },
        modifyGoods: function(param, callback){
          RequestSupport.executePost('/goods/update', {
            goods_id: param._id,
            goods_info: param
          })
            .then(function (data) {
              if (!callback) {
                return data;
              }
              else {
                if (data.err) {
                  return callback(data.err);
                }

                callback(null, data);
              }
            },
            function (err) {
              return callback(SystemError.network_error);
            });
        },
        deleteGoods: function(goodsId, callback){
          RequestSupport.executePost('/goods/delete', {
            goods_id: goodsId
          })
            .then(function (data) {
              if (!callback) {
                return data;
              }
              else {
                if (data.err) {
                  return callback(data.err);
                }

                callback(null, data);
              }
            },
            function (err) {
              return callback(SystemError.network_error);
            });
        },
        translateGoodsStatus: function(role){
          switch(role){
            case 'sold_out':
              return '售罄';
            case 'on_sale':
              return '热卖中';
            case 'opening':
              return '开放中';
            case 'none':
              return '未开放';
            default:
              return '未上架';

          }
        }
      };
    }]);

