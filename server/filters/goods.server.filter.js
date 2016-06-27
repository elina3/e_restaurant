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

var specialMealTypes = require('../enums/business').meal_types.special_enums;

exports.requireAllHealthyMeals = function(req, res, next){
  goodsLogic.getFirstHealthyGoods(specialMealTypes, function(err, goodsList){
    if(err){
      return next(err);
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
    next();
  });
};