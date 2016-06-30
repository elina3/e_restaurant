/**
 * Created by elinaguo on 16/4/17.
 */
'use strict';
angular.module('EClientWeb').factory('GoodsService',
  ['RequestSupport', 'SystemError',
    function (RequestSupport, SystemError) {
      return {
        getNormalGoodsList: function (param, callback) {
          RequestSupport.executeGet('/client/goods/list', {
            skip_count: param.skipCount,
            limit: param.limit,
            type: param.type,
            goods_ids: param.goods_ids
          })
            .then(function (data) {
              if (!callback) {
                return data;
              } else {
                if (data.err) {
                  return callback(data.zh_message || data.err);
                }
                callback(null, data);
              }
            },
            function (err) {
              if (!callback) {
                return SystemError.network_error;
              }
              callback(SystemError.network_error);
            });
        },
        getGoodsDetail: function(goodsId, callback){
          RequestSupport.executeGet('/client/goods', {
            goods_id: goodsId
          })
            .then(function (data) {
              if (!callback) {
                return data;
              } else {
                if (data.err) {
                  return callback(data.zh_message || data.err);
                }
                callback(null, data);
              }
            },
            function (err) {
              if (!callback) {
                return SystemError.network_error;
              }
              callback(SystemError.network_error);
            });
        },
        getFirstFreeMealGoodsDetail: function(callback){
          RequestSupport.executeGet('/client/goods/free_meal', {})
            .then(function (data) {
              if (!callback) {
                return data;
              } else {
                if (data.err) {
                  return callback(data.zh_message || data.err);
                }
                callback(null, data);
              }
            },
            function (err) {
              if (!callback) {
                return SystemError.network_error;
              }
              callback(SystemError.network_error);
            });
        },
        getHealthyNormalGoodsList: function(params, callback){
          RequestSupport.executeGet('/client/goods/healthy_normal', {
            current_page: params.currentPage,
            limit: params.limit,
            skip_count: params.skipCount
          })
            .then(function (data) {
              if (!callback) {
                return data;
              } else {
                if (data.err) {
                  return callback(data.zh_message || data.err);
                }
                callback(null, data);
              }
            },
            function (err) {
              if (!callback) {
                return SystemError.network_error;
              }
              callback(SystemError.network_error);
            });
        }
      };
    }]);
