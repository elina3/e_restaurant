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
  all_enums: ['healthy_normal', 'liquid_diets', 'semi_liquid_diets', 'diabetic_diets', 'low_fat_low_salt_diets',
          'lunch_liquid_diets','lunch_semi_liquid_diets','lunch_diabetic_diets','lunch_low_fat_low_salt_diets',
          'dinner_liquid_diets', 'dinner_semi_liquid_diets', 'dinner_diabetic_diets', 'dinner_low_fat_low_salt_diets'],
  special_enums: ['liquid_diets', 'semi_liquid_diets', 'diabetic_diets', 'low_fat_low_salt_diets',
    'lunch_liquid_diets','lunch_semi_liquid_diets','lunch_diabetic_diets','lunch_low_fat_low_salt_diets',
    'dinner_liquid_diets', 'dinner_semi_liquid_diets', 'dinner_diabetic_diets', 'dinner_low_fat_low_salt_diets']
};