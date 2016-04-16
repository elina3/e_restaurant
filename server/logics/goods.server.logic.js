/**
 * Created by elinaguo on 16/2/23.
 */
'use strict';
var mongooseLib = require('../libraries/mongoose');
var appDb = mongooseLib.appDb;
var Goods = appDb.model('Goods');

var systemError = require('../errors/system');
var goodsError = require('../errors/goods');

exports.addGoods = function(goodsInfo, user, callback){
  if(!goodsInfo.name){
    return callback({err: goodsError.goods_name_null});
  }

  var goods = new Goods({
    name: goodsInfo.name,
    description: goodsInfo.description,
    status: goodsInfo.status,
    price: goodsInfo.price ? parseFloat(goodsInfo.price) : -1,
    unit: goodsInfo.unit ? goodsInfo.unit : '盒',
    discount: goodsInfo.discount ? parseFloat(goodsInfo.discount): 1,
    display_photos: goodsInfo.display_photos,
    description_photos: goodsInfo.description_photos,
    create_user: user._id,
    create_group: user.group,
    deleted_status: false
  });
  goods.save(function(err, newGoods){
    if(err || !newGoods){
      return callback({err: systemError.database_save_error});
    }

    return callback(null, newGoods);
  });
};

function getGoodsDetailById(goodsId, callback){
  Goods.findOne({_id: goodsId})
    .exec(function(err, goods){
      if(err){
        return callback({err: systemError.internal_system_error});
      }

      if(!goods){
        return callback({err: systemError.goods_not_exist});
      }

      if(goods.deleted_status){
        return callback({err: goodsError.goods_deleted});
      }

      return callback(null, goods);
    });
}

exports.getGoodsById = function(goodsId, callback){
  getGoodsDetailById(goodsId, function(err, goods){
    return callback(err, goods);
  });
};

exports.updateGoodsById = function(goodsId, goodsInfo, user, callback){
  if(!goodsId){
    return callback({err: goodsError.goods_id_null});
  }

  if(!goodsInfo.name){
    return callback({err: goodsError.goods_name_null});
  }

  getGoodsDetailById(goodsId, function(err, goods){
    if(err){
      return callback(err);
    }

    Goods.update({_id: goodsId},{$set: {name: goodsInfo.name,
      description: goodsInfo.description,
      price: goodsInfo.price? parseFloat(goodsInfo.price):-1,
      discount: goodsInfo.discount ? parseFloat(goodsInfo.discount): 1,
      display_photos: goodsInfo.display_photos,
      description_photos: goodsInfo.description_photos,
      create_user: user._id,
      create_group: user.group,
      deleted_status: false}}, function(err){
      if(err){
        return callback({err: systemError.internal_system_error});
      }

      return callback(null, true);
    });
  });
};

exports.deleteGoods = function(goodsId, callback){
  getGoodsDetailById(goodsId, function(err, goods){
    if(err){
      return callback(err);
    }

    goods.deleted_status = true;
    goods.save(function(err, newGoods){
      if(err || !newGoods){
        return callback({err: systemError.database_save_error});
      }

      return callback(null, true);
    });
  });
};

exports.getGoodsList = function(currentPage, limit, skipCount, callback){
  var query = {
    deleted_status: false
  };
  Goods.count(query, function(err, totalCount){
    if(err){
      return callback({err: systemError.internal_system_error});
    }

    if (limit === -1) {
      limit = totalCount;
    }

    if (skipCount === -1) {
      skipCount = limit * (currentPage - 1);
    }

    Goods.find(query)
      .sort({update_time: -1})
      .skip(skipCount)
      .limit(limit)
      .exec(function(err, goodsList){
        if(err){
          return callback({err: systemError.internal_system_error});
        }

        return callback(null, {
          totalCount: totalCount,
          limit: limit,
          goodsList: goodsList
        });
      });
  });
};

