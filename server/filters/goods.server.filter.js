/**
 * Created by elinaguo on 16/4/17.
 */
'use strict';
var goodsError = require('../errors/goods');
var goodsLogic = require('../logics/goods');

exports.requireGoods = function(req, res, next){
  var goodsId;
  goodsId = req.body.goods_id || req.query.goods_id;

  if(!goodsId){
    return res.send({err: goodsError.goods_id_null});
  }

  goodsLogic.getGoodsById(goodsId, function(err, goods){
    if(err){
      return next(err);
    }

    if(!goods){
      return next({err: goodsError.goods_not_exist});
    }

    req.goods = goods;
    next();
  });
};

exports.requireAllHealthyMeals = function(req, res, next){
  var mealTypes = ['liquid_diets', 'semi_liquid_diets', 'diabetic_diets', 'low_fat_low_salt_diets'];
  goodsLogic.getFirstHealthyGoods(mealTypes, function(err, goodsList){
    if(err){
      return next(err);
    }

    if(mealTypes.length !== goodsList.length){
      return next({err: goodsError.not_all_healthy_goods});
    }

    req.healthy_meal_dic = {};
    goodsList.forEach(function(goods){
      req.healthy_meal_dic[goods.type] = {
        goods_id: goods._id,
        name: goods.name,
        description: goods.description,
        display_photos: goods.display_photos,
        price: goods.price * 100,
        count: 1
      };
    });
  });
};