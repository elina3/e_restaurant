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

exports.meal_types = {
  enums: ['liquid_diets', 'normal', 'soft_diets', 'semi_liquid_diets'],
  parseStatus: function(status){
    if(this.enums.indexOf(status) > -1){
      return status;
    }

    return '';
  }
};