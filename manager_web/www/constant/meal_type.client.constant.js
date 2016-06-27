/**
 * Created by Wayne on 16/4/19.
 */

'use strict';

angular.module('EWeb').constant('MealTypeConstant', {
  all_enums: ['healthy_normal', 'liquid_diets', 'semi_liquid_diets', 'diabetic_diets', 'low_fat_low_salt_diets',
    'lunch_liquid_diets','lunch_semi_liquid_diets','lunch_diabetic_diets','lunch_low_fat_low_salt_diets',
    'dinner_liquid_diets', 'dinner_semi_liquid_diets', 'dinner_diabetic_diets', 'dinner_low_fat_low_salt_diets'],
  special_enums: ['liquid_diets', 'semi_liquid_diets', 'diabetic_diets', 'low_fat_low_salt_diets',
    'lunch_liquid_diets','lunch_semi_liquid_diets','lunch_diabetic_diets','lunch_low_fat_low_salt_diets',
    'dinner_liquid_diets', 'dinner_semi_liquid_diets', 'dinner_diabetic_diets', 'dinner_low_fat_low_salt_diets'],
  all_drop_menu_options: [{id: 'healthy_normal', text: '普食'},{id: 'liquid_diets', text: '饮食流质（早）'}, {id: 'semi_liquid_diets', text: '半流质饮食（早）'}, {id: 'diabetic_diets', text: '糖尿病饮食（早）'}, {id: 'low_fat_low_salt_diets', text:'低脂低盐饮食（早）'},
                          {id: 'lunch_liquid_diets',text: '流质饮食（中）'},{id: 'lunch_semi_liquid_diets',text: '半流质饮食（中）'},{id: 'lunch_diabetic_diets',text: '糖尿病饮食（中）'},{id: 'lunch_low_fat_low_salt_diets',text: '低脂低盐饮食（中）'},
                          {id: 'dinner_liquid_diets', text: '流质饮食（晚）'},{id: 'dinner_semi_liquid_diets', text: '半流质饮食（晚）'},{id: 'dinner_diabetic_diets', text: '糖尿病饮食（晚）'},{id: 'dinner_low_fat_low_salt_diets',text: '低脂低盐饮食（晚）'}],
  breakfast_drop_menu_options: [{id: 'healthy_normal', text: '普食'},{id: 'liquid_diets', text: '流质饮食（早）'}, {id: 'semi_liquid_diets', text: '半流质饮食（早）'}, {id: 'diabetic_diets', text: '糖尿病饮食（早）'}, {id: 'low_fat_low_salt_diets', text:'低脂低盐饮食（早）'}],
  lunch_drop_menu_options: [{id: 'healthy_normal', text: '普食'},{id: 'lunch_liquid_diets',text: '流质饮食（中）'},{id: 'lunch_semi_liquid_diets',text: '半流质饮食（中）'},{id: 'lunch_diabetic_diets',text: '糖尿病饮食（中）'},{id: 'lunch_low_fat_low_salt_diets',text: '低脂低盐饮食（中）'}],
  dinner_drop_menu_options: [{id: 'healthy_normal', text: '普食'},{id: 'dinner_liquid_diets', text: '流质饮食（晚）'},{id: 'dinner_semi_liquid_diets', text: '半流质饮食（晚）'},{id: 'dinner_diabetic_diets', text: '糖尿病饮食（晚）'},{id: 'dinner_low_fat_low_salt_diets',text: '低脂低盐饮食（晚）'}]
});
