/**
 * Created by elinaguo on 16/7/4.
 */
'use strict';

var mealTypeError = require('../errors/v2_meal_type'),
  systemError = require('../errors/system');
var mongoLib = require('../libraries/mongoose'),
  publicLib = require('../libraries/public');
var appDb = mongoLib.appDb;
var MealType = appDb.model('MealType'),
  PackageMealInfo = appDb.model('PackageMealInfo');


function formatMealTypeInfo(mealTypeInfo, callback) {
  mealTypeInfo = mealTypeInfo || {};
  mealTypeInfo.need_choose_package_meal = publicLib.booleanParse(mealTypeInfo.need_choose_package_meal);
  if(mealTypeInfo.need_choose_package_meal  === null){
    return callback({err: mealTypeError.need_choose_package_meal_null});
  }

  if (!mealTypeInfo.name) {
    return callback({err: mealTypeError.name_null});
  }
  mealTypeInfo.name = mealTypeInfo.name.Trim();

  if (!mealTypeInfo.need_choose_package_meal) {
    var breakfastPrice = publicLib.amountParse(mealTypeInfo.breakfast_price);
    if (breakfastPrice < 0) {
      return callback({err: mealTypeError.invalid_breakfast_price});
    }
    var lunchPrice = publicLib.amountParse(mealTypeInfo.lunch_price);
    if (lunchPrice < 0) {
      return callback({err: mealTypeError.invalid_lunch_price});
    }
    var dinnerPrice = publicLib.amountParse(mealTypeInfo.dinner_price);
    if (dinnerPrice < 0) {
      return callback({err: mealTypeError.invalid_dinner_price});
    }

    mealTypeInfo.breakfast_price = breakfastPrice;
    mealTypeInfo.lunch_price = lunchPrice;
    mealTypeInfo.dinner_price = dinnerPrice;
    mealTypeInfo.package_meals = [];
  }
  else {
    if (mealTypeInfo.package_meals.length === 0) {
      return callback({err: mealTypeError.package_meals_null});
    }

    var invalidMeals = mealTypeInfo.package_meals.filter(function (item) {
      if (!item.name) {
        return true;
      } else {
        item.name = item.name.Trim();
        var price = publicLib.amountParse(item.price);
        if (price >= 0) {
          item.price = price;
        } else {
          return true;
        }
      }
    });

    if (invalidMeals.length > 0) {
      return callback({err: mealTypeError.invalid_package_meals});
    }


    var names = [];
    mealTypeInfo.package_meals.forEach(function (item) {
      if (!names[item.name]) {
        names.push(item.name);
      }
    });

    if (names.length !== mealTypeInfo.package_meals.length) {
      return callback({err: mealTypeError.package_meals_name_repeat});
    }

    var packageMealInfos = mealTypeInfo.package_meals.map(function (item) {
      return new PackageMealInfo({
        name: item.name,
        price: item.price
      });
    });

    mealTypeInfo.breakfast_price = 0;
    mealTypeInfo.lunch_price = 0;
    mealTypeInfo.dinner_price = 0;
    mealTypeInfo.package_meals = packageMealInfos;
  }

  return callback();
}

exports.addNewMealType = function (user, mealTypeInfo, callback) {
  formatMealTypeInfo(mealTypeInfo, function (err) {
    if (err) {
      return callback(err);
    }

    MealType.findOne({
      name: mealTypeInfo.name,
      deleted_status: false
    }, function (err, mealType) {
      if (err) {
        return callback({err: systemError.database_query_error});
      }

      if (mealType) {
        return callback({err: mealTypeError.meal_type_exist});
      }

      mealType = new MealType({
        name: mealTypeInfo.name,
        breakfast_price: mealTypeInfo.breakfast_price,//分
        lunch_price: mealTypeInfo.lunch_price,
        dinner_price: mealTypeInfo.dinner_price,
        need_choose_package_meal: mealTypeInfo.need_choose_package_meal,
        deleted_status: false,
        package_meals: mealTypeInfo.package_meals,
        creator_id: user._id,
        creator_info: {
          username: user.username,
          nickname: user.nickname
        }
      });
      mealType.save(function (err, newMealType) {
        if (err || !newMealType) {
          return callback({err: systemError.database_save_error});
        }

        return callback(null, newMealType);
      });
    });

  });
};

exports.updateNewMealType = function (user, mealType, mealTypeInfo, callback) {
  formatMealTypeInfo(mealTypeInfo, function (err) {
    if (err) {
      return callback(err);
    }

    mealType.breakfast_price = mealTypeInfo.breakfast_price;
    mealType.lunch_price = mealTypeInfo.lunch_price;
    mealType.dinner_price = mealTypeInfo.dinner_price;
    mealType.need_choose_package_meal = mealTypeInfo.need_choose_package_meal;
    mealType.package_meals = mealTypeInfo.package_meals;
    mealType.modify_user_id = user._id;
    mealType.modify_user_info = {
      username: user.username,
      nickname: user.nickname
    };
    mealType.markModified('package_meals');
    mealType.save(function (err, newMealType) {
      if (err || !newMealType) {
        return callback({err: systemError.database_save_error});
      }

      return callback(null, newMealType);
    });
  });
};

exports.deleteMealType = function (user, mealType, callback) {
  mealType.deleted_status = true;
  mealType.modify_user_id = user._id;
  mealType.modify_user_info = {
    username: user.username,
    nickname: user.nickname
  };
  mealType.save(function (err, deletedMealType) {
    if (err || !deletedMealType) {
      return callback({err: systemError.database_save_error});
    }

    return callback(null, deletedMealType);
  });
};

exports.queryMealTypes = function (filter, callback) {
  var query = {
    deleted_status: false
  };
  MealType.find(query)
    .exec(function (err, mealTypes) {
      if (err) {
        return callback({err: systemError.database_query_error});
      }

      return callback(null, mealTypes);
    });
};

exports.getMealTypeById = function (mealTypeId, callback) {
  MealType.findOne({_id: mealTypeId})
    .exec(function (err, mealType) {
      if (err) {
        return callback({err: systemError.database_query_error});
      }

      return callback(null, mealType);
    });
};

exports.getMealTypesWithMealPackages = function (callback) {
  MealType.findOne({
    need_choose_package_meal: true,
    deleted_status: false
  }).exec(function (err, mealTypes) {
    if (err) {
      return callback({err: systemError.database_query_error});
    }
    return callback(null, mealTypes);
  });
};