///**
// * Created by louisha on 15/8/18.
// */
//'use strict';
//angular.module('eWeb').controller('GoodsTemplateController',
//    [
//        '$scope',
//        'GlobalEvent',
//        '$state',
//        '$stateParams',
//        'GoodsService',
//        'QiNiuService',
//        'Config',
//        'AccountServer',
//        '$window',
//        function ($scope,
//                  GlobalEvent,
//                  $state,
//                  $stateParams,
//                  GoodsService,
//                  QiNiuService,
//                  Config,
//                  AccountServer,
//                  $window) {
//            $scope.initPage = {
//                title: '',
//                goodsCategories: [],
//                display_photos: [],
//                description_photos: [],
//                category: '',
//                qiniu_key: '',
//                isEditGoodsPage: false
//            };
//            $scope.goodsObj = {
//                categories: [],
//                brand: '',
//                name: '',
//                display_photos: [],
//                description_photos: [],
//                goods_parameters: ''
//            };
//
//            function getGoodsCategories() {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                GoodsService.getGoodsCategories().then(function (data) {
//                    console.log(data);
//                    if (data.err) {
//                        return $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                    }
//                    if (data.error) {
//                        return $scope.$emit(GlobalEvent.onShowAlert, data.error.type);
//                    }
//                    $scope.initPage.goodsCategories = data.categories;
//                    if (!$scope.initPage.isEditGoodsPage) {
//                        $scope.initPage.category = $scope.initPage.goodsCategories.length > 0 ? $scope.initPage.goodsCategories[0]._id : '';
//                    }
//
//                    getQiniuKey();
//
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            function getGoodsDetailById(goodsId) {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                GoodsService.goodsTemplateById(goodsId, function (err, data) {
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    if (err) {
//                        return $scope.$emit(GlobalEvent.onShowAlert, err.type);
//                    }
//                    $scope.goodsObj.name = data.name || '';
//                    $scope.goodsObj.brand = data.brand ? data.brand.name : '';
//                    $scope.goodsObj.goods_parameters = data.goods_parameters || '';
//                    $scope.goodsObj.categories = data.categories;
//                    $scope.initPage.category = data.categories[0];
//                    $scope.goodsObj.display_photos = data.display_photos;
//                    $scope.goodsObj.description_photos = data.description_photos;
//                    $scope.initPage.display_photos = [];
//                    $scope.initPage.description_photos = [];
//                    initGoodsImageForEdit(data.description_photos, $scope.initPage.description_photos);
//                    initGoodsImageForEdit(data.display_photos, $scope.initPage.display_photos);
//                });
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
//            function getQiniuKey() {
//                QiNiuService.qiNiuKey().then(function (data) {
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    console.log(data);
//                    if (!data) {
//                        return $scope.$emit(GlobalEvent.onShowAlert, '获取七牛上传凭证失败，请刷新网页');
//                    }
//                    if (data.err) {
//                        return $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                    }
//                    if (data.error) {
//                        return $scope.$emit(GlobalEvent.onShowAlert, data.error.type);
//                    }
//                    $scope.initPage.qiniu_key = data.token;
//
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
//                $scope.initPage.category = $scope.initPage.goodsCategories.length > 0 ? $scope.initPage.goodsCategories[0]._id : '';
//                $scope.goodsObj.categories = [];
//                $scope.goodsObj.name = '';
//                $scope.goodsObj.brand = '';
//                $scope.goodsObj.display_photos = [];
//                $scope.goodsObj.description_photos = [];
//                $scope.goodsObj.goods_parameters = '';
//                $scope.initPage.display_photos = [];
//                $scope.initPage.goods_parameters = [];
//            }
//
//
//            function fileUploadStart(index, target) {
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
//                    target[index].img = generalImgUrl(response.key);
//                }, function (response) {
//                    alert(response);
//                    console.log(response);
//                }, function (evt) {
//                    target[index].progress.p = Math.floor(100 * evt.loaded / evt.totalSize);
//                });
//            }
//
//            $scope.imgAbort = function (index, target) {
//                if ($scope.initPage[target][index].upload) {
//                    //待修改的，非上传图片属性不会有这个属性
//                    $scope.initPage[target][index].upload.abort();
//                }
//                $scope.initPage[target].splice(index, 1);
//                $scope.goodsObj[target].splice(index, 1);
//
//            };
//
//            $scope.onFileSelect = function ($files, target) {
//                var offsetx = target.length;
//                for (var i = 0; i < $files.length; i++) {
//                    target[i + offsetx] = {
//                        file: $files[i]
//                    };
//                    fileUploadStart(i + offsetx, target);
//                }
//
//            };
//
//            $scope.getCategoryName = function (categorys) {
//                return GoodsService.getCategoryName(categorys);
//            };
//
//            function goodsParamValid(callback) {
//                if ($scope.goodsObj.name === '') {
//                    return callback('请输入商品名称');
//                }
//                if ($scope.goodsObj.display_photos.length === 0) {
//                    return callback('请至少选择一张商品图片');
//                }
//                return callback();
//            }
//
//            function prepareSubmitGoods() {
//                $scope.goodsObj.name = $window.encodeURI($scope.goodsObj.name, 'UTF-8');
//                $scope.goodsObj.brand = $window.encodeURI($scope.goodsObj.brand, 'UTF-8');
//                $scope.goodsObj.goods_parameters = $window.encodeURI($scope.goodsObj.goods_parameters, 'UTF-8');
//                $scope.goodsObj.categories = [];
//                $scope.goodsObj.categories.push($scope.initPage.category);
//            }
//
//            $scope.submitGoods = function () {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                goodsParamValid(function (err) {
//                    if (err) {
//                        $scope.$emit(GlobalEvent.onShowLoading, false);
//                        return $scope.$emit(GlobalEvent.onShowAlert, err);
//                    } else {
//                        prepareSubmitGoods();
//                        if (!$scope.initPage.isEditGoodsPage) {
//                            GoodsService.createGoodsTemplate($scope.goodsObj, function (err, data) {
//                                $scope.$emit(GlobalEvent.onShowLoading, false);
//                                if (err) {
//                                    return $scope.$emit(GlobalEvent.onShowAlert, err.type);
//                                }
//                                initGoodsObj();
//                                return $scope.$emit(GlobalEvent.onShowAlert, '添加成功');
//                            });
//                        }
//                        else {
//                            GoodsService.goodsTemplateUpdate($stateParams.goodsId, $scope.goodsObj, function (err, data) {
//                                $scope.$emit(GlobalEvent.onShowLoading, false);
//                                if (err) {
//                                    return $scope.$emit(GlobalEvent.onShowAlert, err.type);
//                                }
//                                $scope.$emit(GlobalEvent.onShowAlert, '编辑成功');
//                                $state.go('goodsTemplateList');
//                            });
//                        }
//
//                    }
//                });
//            };
//
//            function initDate() {
//                getGoodsCategories();
//                if ($stateParams.goodsId) {
//                    $scope.initPage.isEditGoodsPage = true;
//                    getGoodsDetailById($stateParams.goodsId);
//                    $scope.initPage.title = '商品模板编辑';
//                }
//                else {
//                    $scope.initPage.title = '商品模板添加';
//                }
//            }
//
//            initDate();
//        }]);
