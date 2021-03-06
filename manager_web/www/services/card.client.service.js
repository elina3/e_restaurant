/**
 * Created by elinaguo on 16/3/30.
 */

'use strict';
angular.module('EWeb').factory('CardService',
  ['Auth', 'RequestSupport', 'SystemError',
    function (Auth, RequestSupport, SystemError) {
      return {
        getCards: function(param,keyword, callback){
          RequestSupport.executeGet('/cards_list', {
            current_page: param.currentPage,
            limit: param.limit,
            skip_count: param.skipCount,
            card_number: keyword.card_number,
            id_number: keyword.registration_id,
            nickname: keyword.nickname,
            type: keyword.type
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
        exportCardsByFilter: function(keyword, callback){
          RequestSupport.executeGet('/cards_list/export_all_by_filter', {
            card_number: keyword.card_number,
            id_number: keyword.registration_id,
            nickname: keyword.nickname,
            type: keyword.type
          }).then(function (data) {
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
        addCard: function (param, callback) {
          RequestSupport.executePost('/card', {
            card_info: param
          })
            .then(function (data) {
              if (!callback) {
                return data;
              }
              else {
                if (data.err) {
                  return callback(data.zh_message || data.err);
                }

                callback(null, data);
              }
            },
            function (err) {
              return callback(SystemError.network_error);
            });
        },
        batchImportCards: function(param, callback){
          RequestSupport.executePost('/cards/import', {
            card_list: param.card_list
          })
            .then(function (data) {
              if (!callback) {
                return data;
              }
              else {
                if (data.err) {
                  return callback(data.zh_message || data.err);
                }

                callback(null, data);
              }
            },
            function (err) {
              return callback(SystemError.network_error);
            });
        },
        modifyCard: function(cardid,param, callback){
          RequestSupport.executePost('/card/modify', {
            card_id:cardid,
            card_info: param
          })
            .then(function (data) {
              if (!callback) {
                return data;
              }
              else {
                if (data.err) {
                  return callback(data.zh_message || data.err);
                }

                callback(null, data);
              }
            },
            function (err) {
              return callback(SystemError.network_error);
            });
        },
        deleteCard: function(cardId, callback){
          RequestSupport.executePost('/card/delete', {
            card_id: cardId
          })
            .then(function (data) {
              if (!callback) {
                return data;
              }
              else {
                if (data.err) {
                  return callback(data.zh_message || data.err);
                }

                callback(null, data);
              }
            },
            function (err) {
              return callback(SystemError.network_error);
            });
        },
        closeCard: function(cardId, callback){
          RequestSupport.executePost('/card/close', {
            card_id: cardId
          })
            .then(function (data) {
              if (!callback) {
                return data;
              }
              else {
                if (data.err) {
                  return callback(data.zh_message || data.err);
                }

                callback(null, data);
              }
            },
            function (err) {
              return callback(SystemError.network_error);
            });
        },
        freezeCard: function(cardId, callback){
          RequestSupport.executePost('/card/freeze', {
            card_id: cardId
          })
            .then(function (data) {
              if (!callback) {
                return data;
              }
              else {
                if (data.err) {
                  return callback(data.zh_message || data.err);
                }

                callback(null, data);
              }
            },
            function (err) {
              return callback(SystemError.network_error);
            });
        },
        cancelFreezeCard: function(cardId, callback){
          RequestSupport.executePost('/card/cancel_freeze', {
            card_id: cardId
          })
            .then(function (data) {
              if (!callback) {
                return data;
              }
              else {
                if (data.err) {
                  return callback(data.zh_message || data.err);
                }

                callback(null, data);
              }
            },
            function (err) {
              return callback(SystemError.network_error);
            });
        },
        replaceCard: function(cardId, newCardNumber, callback){
          RequestSupport.executePost('/card/replace', {
            card_id: cardId,
            new_card_number: newCardNumber
          })
            .then(function (data) {
              if (!callback) {
                return data;
              }
              else {
                if (data.err) {
                  return callback(data.zh_message || data.err);
                }

                callback(null, data);
              }
            },
            function (err) {
              return callback(SystemError.network_error);
            });
        },
        batchRechargeCard: function(addAmount, callback){
          RequestSupport.executePost('/card/recharge/batch', {
            amount: addAmount
          })
            .then(function (data) {
              if (!callback) {
                return data;
              }
              else {
                if (data.err) {
                  return callback(data.zh_message || data.err);
                }

                callback(null, data);
              }
            },
            function (err) {
              return callback(SystemError.network_error);
            });
        },
        getStatistics: function(filter, callback){
          RequestSupport.executeGet('/card/statistics', {
            start_time_stamp: filter.startTimeStamp,
            end_time_stamp: filter.endTimeStamp,
            keyword: filter.keyword
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
        getCardBalance: function(keyword, callback){
          RequestSupport.executeGet('/card/balance', {
            card_number: keyword.card_number,
            id_number: keyword.registration_id,
            nickname: keyword.nickname,
            type: keyword.type
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
        translateCardStatus: function(status){
          switch(status){
            case 'enabled':
              return '已开通';
            case 'disabled':
              return '未开通';
            case 'frozen':
              return '已冻结';
            case 'revoked':
              return '已作废';
            case 'close':
              return '已关闭';
            default:
              return '未开通';
          }
        },
        translateCardType: function(type){
          switch(type){
            case 'normal':
              return '普通';
            case 'staff':
              return '员工';
            case 'expert':
              return '专家';
            default:
              return '普通';
          }
        },
        translateCardRechargeType: function(rechargeType){
          switch (rechargeType){
            case 'cash':
              return '现金';
            case 'virtual':
              return '虚拟';
            default:
              return '现金';
          }
        },
        changeCardPassword: function(param, callback){
          RequestSupport.executePost('/card/change_password', param)
            .then(function (data) {
              if (!callback) {
                return data;
              }
              else {
                if (data.err) {
                  return callback(data.zh_message || data.err);
                }

                callback(null, data);
              }
            },
            function (err) {
              return callback(SystemError.network_error);
            });
        }
      };
    }]);

