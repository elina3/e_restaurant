/**
 * Created by elinaguo on 16/4/24.
 */
'use strict';

exports.card_status = {
  enums: ['disabled', 'enabled', 'frozen', 'revoked'],
  parseStatus: function(status){
    if(this.enums.indexOf(status) > -1){
      return status;
    }

    return '';
  }
};