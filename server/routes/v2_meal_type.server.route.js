/**
 * Created by elinaguo on 16/7/4.
 */
'use strict';
var mealTypeController = require('../controllers/v2_meal_type');
var authFilter = require('../filters/auth'),
  mealTypeFilter = require('../filters/v2_meal_Type');

module.exports = function (app) {
  //添加营养餐种类
  app.route('/v2/meal_type/add').post(authFilter.requireUser, mealTypeController.createMealType);
  app.route('/v2/meal_type/modify').post(authFilter.requireUser, mealTypeFilter.requireMealType, mealTypeController.updateMealType);
  app.route('/v2/meal_type/delete').post(authFilter.requireUser, mealTypeFilter.requireMealType, mealTypeController.deleteMealType);

  //根据条件获取所有营养餐种类
  app.route('/v2/meal_type/list').get(authFilter.requireUser, mealTypeController.getMealTypesByFilter);
  app.route('/v2/meal_type/detail').get(authFilter.requireUser, mealTypeFilter.requireMealType, mealTypeController.getMealType);


};
