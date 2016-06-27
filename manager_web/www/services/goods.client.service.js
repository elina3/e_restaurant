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
        },
        translateGoodsType: function(type){
          switch(type){
            case 'normal':
              return '普通';
            case 'free_meal':
              return '工作餐';
            case 'healthy_normal':
              return '营养餐普食';
            case 'liquid_diets':
              return '流质饮食';
            case 'semi_liquid_diets':
              return '半流质饮食';
            case 'diabetic_diets':
              return '糖尿病饮食';
              case 'low_fat_low_salt_diets':
              return '低脂低盐饮食';
            case 'lunch_liquid_diets':
              return '流质饮食（中）';
            case 'lunch_semi_liquid_diets':
              return '半流质饮食（中）';
            case 'lunch_diabetic_diets':
              return '糖尿病饮食（中）';
            case 'lunch_low_fat_low_salt_diets':
              return '低脂低盐饮食（中）';
            case 'dinner_liquid_diets':
              return '流质饮食（晚）';
            case 'dinner_semi_liquid_diets':
              return '半流质饮食（晚）';
            case 'dinner_diabetic_diets':
              return '糖尿病饮食（晚）';
            case 'dinner_low_fat_low_salt_diets':
              return '低脂低盐饮食（晚）';
            default:
              return '未上架';

          }
        }
      };
    }]);

