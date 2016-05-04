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
            registration_id: keyword.registration_id
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
            default:
              return '普通';
          }
        }
      };
    }]);

