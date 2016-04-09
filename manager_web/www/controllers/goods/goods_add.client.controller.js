///**
// * Created by louisha on 15/6/19.
// */
//'use strict';
//angular.module('eWeb').controller('GoodsAddController',
//    ['$scope', 'GlobalEvent', '$state', '$stateParams', 'GoodsService', 'Global', '$base64', 'QiNiuService', 'Config', 'AccountServer', '$window', '$timeout',
//        function ($scope, GlobalEvent, $state, $stateParams, GoodsService, Global, $base64, QiNiuService, Config, AccountServer, $window, $timeout) {
//
//            var isEditGoodsPage = false;
//            $scope.isCreate = !isEditGoodsPage;
//            $scope.initPage = {
//                title: '',
//                goods: null,
//                goodsCategories: [],
//                display_photos: [],
//                description_photos: [],
//                banner_photos: [],
//                qiniu_key: '',
//                sku_features_input: '',
//                provinces: [],
//                citys: [],
//                countys: [],
//                province: [],
//                city: [],
//                county: [],
//                distributor: null,
//                distributorList: [],
//                goodsTemplates: []
//            };
//            $scope.goodsObj = {
//                category: '',
//                name: '',
//                market_price: '',
//                price: '',
//                display_photos: [],
//                goods_parameters: '',
//                description: '',
//                description_photos: [],
//                recommend: 'false',
//                banner_recommend: 'false',
//                banner_photos: [],
//                sku_features: [{key: 'features', value: []}],
//                district: '',
//                self_production: 'true',
//                distributor: '',
//                source: '柱柱自营'
//            };
//
//            function getGoodsCategories() {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                GoodsService.getGoodsCategories().then(function (data) {
//                    console.log(data);
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    if (data.err) {
//                        $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                    }
//                    else {
//                        $scope.initPage.goodsCategories = data.categories;
//                        if (!$scope.initPage.goods) {
//                            $scope.goodsObj.category = $scope.initPage.goodsCategories.length > 0 ? $scope.initPage.goodsCategories[0]._id : '';
//                        }
//
//                    }
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            function getQiniuKey() {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                QiNiuService.qiNiuKey().then(function (data) {
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    console.log(data);
//                    $scope.initPage.qiniu_key = data.token;
//
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            function getDistributorListByDistrict() {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                var district = $scope.initPage.province + '-' + $scope.initPage.city + '-' + $scope.initPage.county;
//                AccountServer.getDistributorListByDistrict(district).then(function (data) {
//                    console.log(data);
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    if (data.err) {
//                        $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                    }
//                    if (data.error) {
//                        $scope.$emit(GlobalEvent.onShowAlert, data.error.type);
//                    }
//                    else {
//                        $scope.initPage.distributorList = data.distributors;
//                    }
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            function generalImgUrl(imgName) {
//                return Config.qiniuServerAddress + imgName;
//            }
//
//            function initGoodsObj() {
//                $scope.goodsObj.category = $scope.initPage.goodsCategories.length > 0 ? $scope.initPage.goodsCategories[0]._id : '';
//                $scope.goodsObj.name = '';
//                $scope.goodsObj.market_price = '';
//                $scope.goodsObj.price = '';
//                $scope.goodsObj.display_photos = [];
//                $scope.goodsObj.goods_parameters = '';
//                $scope.goodsObj.description = '';
//                $scope.goodsObj.recommend = 'false';
//                $scope.goodsObj.banner_recommend = 'false';
//                $scope.goodsObj.description_photos = [];
//                $scope.goodsObj.sku_features = [{key: 'features', value: []}];
//                $scope.goodsObj.district = '';
//                $scope.goodsObj.source = '邻里邻店自营';
//                $scope.goodsObj.distributor = '';
//                $scope.goodsObj.self_production = 'true';
//                $scope.initPage.display_photos = [];
//                $scope.initPage.description_photos = [];
//                $scope.initPage.banner_photos = [];
//                $scope.initPage.sku_features_input = '';
//                $scope.initPage.distributor = null;
//
//            }
//
//            function initGoodsImageForEdit(photos, target) {
//                for (var i = 0; i < photos.length; i++) {
//                    var obj = {
//                        img: generalImgUrl(photos[i])
//
//                    };
//                    target.push(obj);
//                }
//            }
//
//
//            function initAreaInfo() {
//                Global.getAreaInfo(function (err, area) {
//                    if (area) {
//                        initArea(area);
//                    }
//                });
//
//            }
//
//            function initArea(province) {
//                $scope.initPage.province = province[0].name;
//                $scope.initPage.city = province[0].citys[0].name;
//                $scope.initPage.county = province[0].citys[0].county[0].name;
//                getDistributorListByDistrict();
//                province.forEach(function (p) {
//                    $scope.initPage.provinces.push(p.name);
//                    p.citys.forEach(function (c) {
//                        $scope.initPage.citys.push(c.name);
//                        c.county.forEach(function (co) {
//                            $scope.initPage.countys.push(co.name);
//                        });
//                    });
//                });
//            }
//
//            function initDate() {
//                if ($stateParams.goodsId) {
//                    isEditGoodsPage = true;
//                    $scope.isCreate = false;
//                    $scope.getGoodsDetailById($stateParams.goodsId);
//                    $scope.initPage.title = '商品编辑';
//                }
//                else {
//                    $scope.initPage.title = '商品添加';
//                }
//
//            }
//
//            function start(index, target) {
//                target[index].progress = {
//                    p: 0
//                };
//                target[index].upload = QiNiuService.upload({
//                    //key: '',
//                    file: target[index].file,
//                    token: $scope.initPage.qiniu_key
//                });
//                target[index].upload.then(function (response) {
//                    console.log(response);
//                    if (target === $scope.initPage.display_photos) {
//                        $scope.goodsObj.display_photos.splice(index, 0, response.key);
//                    }
//                    else if (target === $scope.initPage.description_photos) {
//                        $scope.goodsObj.description_photos.splice(index, 0, response.key);
//                    }
//                    else if (target === $scope.initPage.banner_photos) {
//                        $scope.goodsObj.banner_photos[0] = response.key;
//                    }
//                    target[index].img = generalImgUrl(response.key);
//                }, function (response) {
//                    alert(response);
//                    console.log(response);
//                }, function (evt) {
//                    target[index].progress.p = Math.floor(100 * evt.loaded / evt.totalSize);
//                });
//            }
//
//            $scope.getGoodsDetailById = function (goodsId) {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                GoodsService.getGoodsById(goodsId).then(function (data) {
//                    console.log(data);
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    if (data.err) {
//                        $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                    }
//                    else {
//                        $scope.initPage.goods = data.goods;
//                        if ($scope.initPage.goods) {
//                            $scope.goodsObj.category = $scope.initPage.goods.categories[0]._id;
//                            $scope.goodsObj.name = $scope.initPage.goods.name || '';
//                            $scope.goodsObj.goods_parameters = $scope.initPage.goods.goods_parameters || '';
//                            $scope.goodsObj.description = $scope.initPage.goods.description || '';
//                            $scope.goodsObj.market_price = $scope.initPage.goods.market_price;
//                            $scope.goodsObj.price = $scope.initPage.goods.price;
//                            $scope.goodsObj.display_photos = $scope.initPage.goods.display_photos;
//                            $scope.goodsObj.description_photos = $scope.initPage.goods.description_photos;
//                            $scope.goodsObj.recommend = $scope.initPage.goods.recommend.toString();
//                            $scope.goodsObj.banner_recommend = $scope.initPage.goods.banner_recommend.toString();
//                            $scope.goodsObj.banner_photos = $scope.initPage.goods.banner_photos;
//                            $scope.goodsObj.district = $scope.initPage.goods.district || '';
//                            $scope.goodsObj.self_production = $scope.initPage.goods.self_production.toString();
//                            $scope.goodsObj.distributor = $scope.initPage.goods.distributor;
//                            $scope.goodsObj.source = $scope.initPage.goods.source;
//                            if ($scope.goodsObj.district !== '') {
//                                var area = $scope.initPage.goods.district.split('-');
//                                $scope.initPage.province = area[0];
//                                $scope.initPage.city = area[1];
//                                $scope.initPage.county = area[2];
//                            }
//
//                            if ($scope.initPage.goods.sku_features && $scope.initPage.goods.sku_features.length > 0) {
//                                if ($scope.initPage.goods.sku_features[0].value && $scope.initPage.goods.sku_features[0].value.length > 0) {
//                                    $scope.goodsObj.sku_features = $scope.initPage.goods.sku_features;
//                                }
//                            }
//
//                            $scope.initPage.description_photos = [];
//                            $scope.initPage.display_photos = [];
//                            $scope.initPage.banner_photos = [];
//                            initGoodsImageForEdit($scope.initPage.goods.description_photos, $scope.initPage.description_photos);
//                            initGoodsImageForEdit($scope.initPage.goods.display_photos, $scope.initPage.display_photos);
//                            initGoodsImageForEdit($scope.initPage.goods.banner_photos, $scope.initPage.banner_photos);
//
//                        }
//                    }
//                    $scope.initPage.goodsTemplates = [];
//                }, function (err) {
//                    console.log(err);
//                });
//            };
//
//            $scope.$on(GlobalEvent.onBodyClick, function () {
//                $scope.initPage.goodsTemplates = [];
//            });
//
//            $scope.getGoodsTemplatesByKeyword = function () {
//                $timeout(function () {
//                    GoodsService.getGoodsTemplateListByUser($scope.goodsObj.name, 10).then(function (data) {
//                        console.log(data);
//                        $scope.initPage.goodsTemplates = data.goods_templates;
//                    }, function (err) {
//                        console.log(err);
//                    });
//                });
//            };
//
//            $scope.abort = function (index, target) {
//                if (target[index].upload) {
//                    //待修改的，非上传图片属性不会有这个属性
//                    target[index].upload.abort();
//
//                }
//                target.splice(index, 1);
//                if (target === $scope.initPage.display_photos) {
//                    $scope.goodsObj.display_photos.splice(index, 1);
//                }
//                else if (target === $scope.initPage.description_photos) {
//                    $scope.goodsObj.description_photos.splice(index, 1);
//                }
//                else if (target === $scope.initPage.banner_photos) {
//                    $scope.goodsObj.banner_photos.splice(index, 1);
//                }
//            };
//
//            $scope.onFileSelect = function ($files, target) {
//                var offsetx = target.length;
//                if (target === $scope.initPage.banner_photos) {
//                    target[0] = {
//                        file: $files[0]
//                    };
//                    start(0, target);
//                }
//                else {
//                    for (var i = 0; i < $files.length; i++) {
//                        target[i + offsetx] = {
//                            file: $files[i]
//                        };
//                        start(i + offsetx, target);
//                    }
//                }
//
//            };
//
//            $scope.getCategoryName = function (categorys) {
//                return GoodsService.getCategoryName(categorys);
//            };
//
//            $scope.skuFeaturesAdd = function () {
//                //sku_features: [{key: '香味', value: ['苹果香','柠檬酸','薄荷凉','香橙甜']}],
//                if ($scope.initPage.sku_features_input === '') {
//                    return;
//                }
//                //var _index = $scope.goodsObj.sku_features.length;
//                //var _key = 'sku_features_' + _index;
//                //var obj = {key: _key, value: [$scope.initPage.sku_features_input]};
//                //$scope.goodsObj.sku_features[0].value.push(obj);
//                $scope.goodsObj.sku_features[0].value.push($scope.initPage.sku_features_input);
//                $scope.initPage.sku_features_input = '';
//            };
//
//            $scope.skuFeaturesRemove = function (index) {
//                $scope.goodsObj.sku_features[0].value.splice(index, 1);
//            };
//
//            function generateDistrcit(province, city, county) {
//                return province + '-' + city + '-' + county;
//            }
//
//            function goodsParamValid(callback) {
//                if ($scope.goodsObj.name === '') {
//                    return callback('请输入商品名称');
//                }
//
//                if ($scope.isCreate && $scope.goodsObj.market_price === '') {
//                    return callback('请输入商品价格');
//                }
//
//                if ($scope.goodsObj.display_photos.length === 0) {
//                    return callback('请至少选择一张展示图片');
//                }
//
//                if ($scope.goodsObj.description_photos.length === 0) {
//                    return callback('请至少选择一张商品图片');
//                }
//
//                if ($scope.goodsObj.banner_recommend === 'true' && $scope.goodsObj.banner_photos.length === 0) {
//                    return callback('请选择一张banner推荐照片');
//                }
//
//                if ($scope.initPage.province === '' || $scope.initPage.city === '' || $scope.initPage.county === '') {
//                    return callback('请选择地区');
//                }
//
//                if ($scope.goodsObj.self_production === 'false' && !$scope.goodsObj.distributor) {
//                    return callback('请选择合作商');
//                }
//
//                return callback();
//            }
//
//            function prepareSubmitGoods() {
//                $scope.goodsObj.district = generateDistrcit($scope.initPage.province, $scope.initPage.city, $scope.initPage.county);
//                $scope.goodsObj.name = $window.encodeURI($scope.goodsObj.name, 'UTF-8');
//                $scope.goodsObj.goods_parameters = $window.encodeURI($scope.goodsObj.goods_parameters, 'UTF-8');
//                $scope.goodsObj.description = $window.encodeURI($scope.goodsObj.description, 'UTF-8');
//                if ($scope.goodsObj.banner_recommend !== 'true' && $scope.goodsObj.banner_recommend !== true && $scope.goodsObj.banner_photos.length > 0) {
//                    $scope.goodsObj.banner_photos = [];
//                    $scope.initPage.banner_photos = [];
//                }
//
//                if ($scope.initPage.distributor) {
//                    var obj = JSON.parse($scope.initPage.distributor);
//                    if (obj) {
//                        $scope.goodsObj.source = obj.name;
//                        $scope.goodsObj.distributor = obj._id;
//                    }
//                }
//            }
//
//            function createNewGoods(callback) {
//                GoodsService.createGoods($scope.goodsObj).then(function (data) {
//                    console.log(data);
//                    if (data.err) {
//                        return callback(data.err);
//                    }
//                    else if (data.error) {
//                        return callback(data.error);
//                    }
//                    else {
//                        return callback();
//                    }
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            function editGoods(callback) {
//                GoodsService.updateGoods($scope.initPage.goods._id, $scope.goodsObj).then(function (data) {
//                    console.log(data);
//                    if (data.err) {
//                        return callback(data.err);
//                    }
//                    else if (data.error) {
//                        return callback(data.error);
//                    }
//
//                    return callback();
//
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            $scope.submitNewGoods = function () {
//                goodsParamValid(function (err) {
//                    if (err) {
//                        return $scope.$emit(GlobalEvent.onShowAlert, err);
//                    } else {
//
//                        prepareSubmitGoods();
//
//                        $scope.$emit(GlobalEvent.onShowLoading, true);
//                        if (isEditGoodsPage) {
//                            editGoods(function (err) {
//                                $scope.$emit(GlobalEvent.onShowLoading, false);
//                                if (err) {
//                                    console.log(err);
//                                    return $scope.$emit(GlobalEvent.onShowAlert, err.type);
//                                } else {
//                                    $scope.$emit(GlobalEvent.onShowAlert, '商品编辑成功');
//                                    $state.go('goodsList');
//                                }
//                            });
//                        }
//                        else {
//                            createNewGoods(function (err) {
//                                $scope.$emit(GlobalEvent.onShowLoading, false);
//                                if (err) {
//                                    return $scope.$emit(GlobalEvent.onShowAlert, err.type);
//                                } else {
//                                    initGoodsObj();
//                                    return $scope.$emit(GlobalEvent.onShowAlert, '商品添加成功');
//                                }
//                            });
//                        }
//                    }
//                });
//            };
//
//            $scope.updateDistributorList = function () {
//                getDistributorListByDistrict();
//            };
//
//            getGoodsCategories();
//            getQiniuKey();
//            initAreaInfo();
//            initDate();
//        }]);
