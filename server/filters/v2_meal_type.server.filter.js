/**
 * Created by elinaguo on 16/7/6.
 */
'use strict';
var config = require('../config/config');
var mongoLib = require('../libraries/mongoose'),
  mealTypeLogic = require('../logics/v2_meal_type'),
  mealTypeError = require('../errors/v2_meal_type');

exports.requireMealType = function (req, res, next) {
  var mealTypeId = req.body.meal_type_id ||req.query.meal_type_id || '';
  mealTypeLogic.getMealTypeById(mealTypeId, function(err, mealType){
    if(err){
      return next(err);
    }

    if(!mealType){
      return next({err: mealTypeError.meal_type_not_exist});
    }

    if(mealType.deleted_status){
      return next({err: mealTypeError.meal_type_deleted});
    }

    req.meal_type = mealType;
    next();
  });
};