/**
 * Created by elinaguo on 16/2/23.
 */
'use strict';
var async = require('async');
var mongooseLib = require('../libraries/mongoose');
var appDb = mongooseLib.appDb;
var Goods = appDb.model('Goods');

var systemError = require('../errors/system');
var goodsError = require('../errors/goods');

exports.addGoods = function (goodsInfo, user, callback) {
  if (!goodsInfo.name) {
    return callback({err: goodsError.goods_name_null});
  }
  var goods = new Goods({
    name: goodsInfo.name,
    description: goodsInfo.description,
    type: goodsInfo.type || 'normal',
    status: goodsInfo.status,
    price: goodsInfo.price ? parseFloat(goodsInfo.price) : -1,
    unit: goodsInfo.unit ? goodsInfo.unit : '盒',
    discount: goodsInfo.discount ? parseFloat(goodsInfo.discount) : 1,
    display_photos: goodsInfo.display_photos,
    description_photos: goodsInfo.description_photos,
    create_user: user._id,
    create_group: user.group,
    deleted_status: false
  });
  goods.save(function (err, newGoods) {
    if (err || !newGoods) {
      return callback({err: systemError.database_save_error});
    }

    return callback(null, newGoods);
  });
};

function getGoodsDetailById(goodsId, callback) {
  Goods.findOne({_id: goodsId})
    .exec(function (err, goods) {
      if (err) {
        return callback({err: systemError.internal_system_error});
      }

      if (!goods) {
        return callback({err: goodsError.goods_not_exist});
      }

      if (goods.deleted_status) {
        return callback({err: goodsError.goods_deleted});
      }

      return callback(null, goods);
    });
}

exports.getGoodsById = function (goodsId, callback) {
  getGoodsDetailById(goodsId, function (err, goods) {
    return callback(err, goods);
  });
};

exports.updateGoodsById = function (goodsId, goodsInfo, user, callback) {
  if (!goodsId) {
    return callback({err: goodsError.goods_id_null});
  }

  if (!goodsInfo.name) {
    return callback({err: goodsError.goods_name_null});
  }

  getGoodsDetailById(goodsId, function (err, goods) {
    if (err) {
      return callback(err);
    }

    Goods.update({_id: goodsId}, {
      $set: {
        name: goodsInfo.name,
        description: goodsInfo.description,
        type: goodsInfo.type || 'normal',
        price: goodsInfo.price ? parseFloat(goodsInfo.price) : -1,
        discount: goodsInfo.discount ? parseFloat(goodsInfo.discount) : 1,
        display_photos: goodsInfo.display_photos,
        description_photos: goodsInfo.description_photos,
        create_user: user._id,
        create_group: user.group,
        status: goodsInfo.status,
        deleted_status: false
      }
    }, function (err) {
      if (err) {
        return callback({err: systemError.internal_system_error});
      }

      return callback(null, true);
    });
  });
};

exports.deleteGoods = function (goodsId, callback) {
  getGoodsDetailById(goodsId, function (err, goods) {
    if (err) {
      return callback(err);
    }

    goods.deleted_status = true;
    goods.save(function (err, newGoods) {
      if (err || !newGoods) {
        return callback({err: systemError.database_save_error});
      }

      return callback(null, true);
    });
  });
};

function queryGoodsList(query, currentPage, limit, skipCount, callback) {

  Goods.count(query, function (err, totalCount) {
    if (err) {
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
      .exec(function (err, goodsList) {
        if (err) {
          return callback({err: systemError.internal_system_error});
        }

        return callback(null, {
          totalCount: totalCount,
          limit: limit,
          goodsList: goodsList
        });
      });
  });
}

exports.getGoodsList = function (currentPage, limit, skipCount, callback) {
  var query = {
    deleted_status: false
  };
  queryGoodsList(query, currentPage, limit, skipCount, function (err, result) {
    return callback(err, result);
  });
};

exports.getFirstHealthyGoods = function (healthyTypes, callback) {
  var query = {type: {$in: healthyTypes}, deleted_status: false, status: 'on_sale'};

  Goods.aggregate([
    {$match: query},
    {
      $group: {
        _id: '$type',
        goodsList: {$push: '$$ROOT'}
      }
    }
  ], function (err, result) {
    if (err || !result) {
      return callback({err: systemError.database_query_error});
    }

    if (result.length !== healthyTypes.length) {
      return callback({err: goodsError.not_all_healthy_goods})
    }

    var goodsList = result.map(function (item) {
      return item.goodsList[0];
    });
    return callback(null, goodsList);
  });
};

exports.getOpeningGoodsList = function (filter, currentPage, limit, skipCount, callback) {
  var query = {
    deleted_status: false,
    status: {$nin: ['none']}
  };

  if (filter.goodsType) {
    query.type = filter.goodsType;
  }

  if(filter.goodsIds && filter.goodsIds.length > 0){
    query._id = {$in: filter.goodsIds};
  }

  queryGoodsList(query, currentPage, limit, skipCount, function (err, result) {
    return callback(err, result);
  });
};

exports.getGoodsInfos = function (goodsIds, callback) {
  var query = {
    deleted_status: false,
    _id: {$in: goodsIds}
  };
  queryGoodsList(query, 1, -1, -1, function (err, result) {
    if (err) {
      return callback(err);
    }

    return callback(null, result.goodsList);

  });
};

exports.getFirstFreeMealGoods = function (callback) {
  Goods.find({deleted_status: false, type: 'free_meal'})
    .exec(function (err, freeMeals) {
      if (err || !freeMeals) {
        return callback({err: systemError.database_query_error});
      }

      return callback(null, freeMeals[0]);
    });
};

exports.getHealthyNormalGoodsList = function (pagination, callback) {
  var query = {
    deleted_status: false,
    status: 'on_sale',
    type: 'healthy_normal'
  };

  queryGoodsList(query, pagination.current_page, pagination.limit, pagination.skip_count, function (err, result) {
    return callback(err, result);
  });
};