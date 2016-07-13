/**
 * Created by elinaguo on 16/7/4.
 */
'use strict';
var mealTypeLogic = require('../logics/v2_meal_type');
var systemError = require('../errors/system');

exports.createMealType = function(req, res, next){
  mealTypeLogic.addNewMealType(req.user, req.body.meal_type_info, function(err, mealType){
    if(err){
      return next(err);
    }

    req.data = {
      meal_type: mealType
    };
    return next();
  });
};


exports.updateMealType = function(req, res, next){
  mealTypeLogic.updateNewMealType(req.user, req.meal_type, req.body.meal_type_info, function(err, newMealType){
    if(err){
      return next(err);
    }

    req.data = {
      meal_type: newMealType
    };
    return next();
  });
};

exports.deleteMealType = function(req, res, next){
  mealTypeLogic.deleteMealType(req.user, req.meal_type, function(err, mealType){
    if(err){
      return next(err);
    }

    req.data = {
      success: mealType ? true : false
    }
    return next();
  });
};

exports.getMealTypesByFilter = function(req, res, next){
  mealTypeLogic.queryMealTypes({}, function(err, mealTypes){
    if(err){
      return next(err);
    }

    req.data = {
      meal_types: mealTypes
    };
    return next();
  });
};

exports.getNeedChooseMealTypes = function(req, res, next){
  mealTypeLogic.getMealTypesWithMealPackages(function(err, mealTypes){
    if(err){
      return next(err);
    }

    req.data = {
      meal_types: mealTypes
    };
    return next();
  });
};

exports.getMealType = function(req, res, next){
  req.data = {
    meal_type: req.meal_type
  };
  return next();
};