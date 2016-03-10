///**
// * Created by louisha on 15/6/19.
// */
//'use strict';
//angular.module('eWeb').controller('GrocerSignUpController',
//    ['$rootScope',
//        '$scope',
//        'GlobalEvent',
//        '$base64',
//        'Global',
//        'BMapService',
//        'QiNiuService',
//        'Config',
//        'SignService',
//        '$stateParams',
//        'AccountServer',
//        '$state',
//        function ($rootScope, $scope, GlobalEvent, $base64, Global, BMapService, QiNiuService, Config, SignService, $stateParams, AccountServer, $state) {
//
//            function getDomById(id) {
//                return document.getElementById(id);
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
//            function getGrocerById(id) {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                AccountServer.getGrocerById(id).then(function (data) {
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    console.log(data);
//                    if (data.err) {
//                        return $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                    }
//                    if (data.error) {
//                        return $scope.$emit(GlobalEvent.onShowAlert, data.error.type);
//                    }
//                    $scope.initPage.account = data.grocer;
//                    if ($scope.initPage.account) {
//                        $scope.signUpObject.username = $scope.initPage.account.username;
//                        $scope.signUpObject.password = $scope.initPage.account.password;
//                        $scope.signUpObject.nickname = $scope.initPage.account.nickname;
//                        $scope.signUpObject.grocery_name = $scope.initPage.account.grocery_name;
//                        $scope.signUpObject.grocery_area = $scope.initPage.account.grocery_area;
//                        $scope.signUpObject.grocery_photos = $scope.initPage.account.grocery_photos;
//                        $scope.signUpObject.grocery_address = $scope.initPage.account.grocery_address;
//                        $scope.signUpObject.grocery_longitude = $scope.initPage.account.grocery_location[0];
//                        $scope.signUpObject.grocery_latitude = $scope.initPage.account.grocery_location[1];
//                        $scope.signUpObject.grocery_annual_sales = $scope.initPage.account.grocery_annual_sales;
//                        $scope.signUpObject.district = $scope.initPage.account.district || '';
//                        if ($scope.signUpObject.district !== '') {
//                            var area = $scope.initPage.account.district.split('-');
//                            $scope.initPage.province = area[0];
//                            $scope.initPage.city = area[1];
//                            $scope.initPage.county = area[2];
//                        }
//                        for (var i = 0; i < $scope.initPage.account.grocery_photos.length; i++) {
//                            var obj = {
//                                img: Config.qiniuServerAddress + $scope.initPage.account.grocery_photos[i]
//
//                            };
//                            $scope.initPage.grocery_photo.push(obj);
//                        }
//
//                    }
//
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            $scope.initPage = {
//                showMap: false,
//                map: null,
//                grocery_photo: [],
//                qiniu_key: '',
//                search_key: '',
//                provinces: [],
//                citys: [],
//                countys: [],
//                province: '',
//                city: '',
//                county: '',
//                account: null,
//                title: '',
//                annual_sales: ['20万以下', '20-50万', '50-100万', '100-150万', '150-200万', '200万以上']
//            };
//            $scope.signUpObject = {
//                username: '',
//                password: '',
//                nickname: '',
//                phone: '',
//                mobile_phone: '',
//                grocery_name: '',
//                grocery_photos: [],
//                grocery_area: '',
//                grocery_longitude: '',
//                grocery_latitude: '',
//                grocery_address: '',
//                business_license: '',
//                grocery_annual_sales: '',
//                district: ''
//            };
//
//            function initSignUpObject() {
//                $scope.signUpObject.username = '';
//                $scope.signUpObject.password = '';
//                $scope.signUpObject.nickname = '';
//                $scope.signUpObject.phone = '';
//                $scope.signUpObject.mobile_phone = '';
//                $scope.signUpObject.grocery_name = '';
//                $scope.signUpObject.grocery_area = '';
//                $scope.signUpObject.grocery_photos = [];
//                $scope.signUpObject.grocery_address = '';
//                $scope.signUpObject.grocery_longitude = '';
//                $scope.signUpObject.grocery_latitude = '';
//                $scope.signUpObject.business_license = '';
//                $scope.signUpObject.grocery_annual_sales = '';
//                $scope.signUpObject.district = '';
//
//                $scope.initPage.grocery_photo = [];
//            }
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
//
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
//                $scope.initPage.grocery_photo = [];
//                if ($stateParams.account) {
//                    $scope.initPage.title = '小店编辑';
//                    getGrocerById($stateParams.account);
//                }
//                else {
//                    $scope.initPage.title = '小店注册';
//                }
//
//                initMap();
//
//            }
//
//            function start(index) {
//                $scope.initPage.grocery_photo[index].progress = {
//                    p: 0
//                };
//                $scope.initPage.grocery_photo[index].upload = QiNiuService.upload({
//                    //key: '',
//                    file: $scope.initPage.grocery_photo[index].file,
//                    token: $scope.initPage.qiniu_key
//                });
//                $scope.initPage.grocery_photo[index].upload.then(function (response) {
//                    console.log(response);
//                    $scope.signUpObject.grocery_photos.splice(index, 0, response.key);
//                    $scope.initPage.grocery_photo[index].img = Config.qiniuServerAddress + response.key;
//
//                }, function (response) {
//                    console.log(response);
//                }, function (evt) {
//                    $scope.initPage.grocery_photo[index].progress.p = Math.floor(100 * evt.loaded / evt.totalSize);
//                });
//            }
//
//            $scope.abort = function (index) {
//                if ($scope.initPage.grocery_photo[index].upload) {
//                    //待修改的，非上传图片属性不会有这个属性
//                    $scope.initPage.grocery_photo[index].upload.abort();
//
//                }
//                $scope.initPage.grocery_photo.splice(index, 1);
//                $scope.signUpObject.grocery_photos.splice(index, 1);
//            };
//
//            $scope.onFileSelect = function ($files) {
//                var offsetx = $scope.initPage.grocery_photo.length;
//                for (var i = 0; i < $files.length; i++) {
//                    $scope.initPage.grocery_photo[i + offsetx] = {
//                        file: $files[i]
//                    };
//                    start(i + offsetx);
//                }
//            };
//
//            $scope.showMap = function () {
//                $scope.initPage.showMap = true;
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                BMapService.setToLocation($scope.initPage.map, function () {
//                    $scope.$apply(function () {
//                        $scope.$emit(GlobalEvent.onShowLoading, false);
//                    });
//                });
//            };
//
//            $scope.hideMap = function () {
//                $scope.initPage.showMap = false;
//            };
//
//            $scope.refreshLocation = function () {
//                var current = $scope.initPage.map.getCenter();
//                $scope.signUpObject.grocery_latitude = current.lat;
//                $scope.signUpObject.grocery_longitude = current.lng;
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                BMapService.refreshLocation($scope.initPage.map, function (addComp) {
//                    $scope.$apply(function () {
//                        $scope.$emit(GlobalEvent.onShowLoading, false);
//                        $scope.signUpObject.grocery_address = BMapService.getAddressStrByMap(addComp);
//                        $scope.hideMap();
//
//                    });
//                });
//            };
//
//            $scope.signUp = function () {
//                //console.log($scope.signUpObject.grocery_annual_sales);
//                if ($scope.signUpObject.username.length < 11) {
//                    return $scope.$emit(GlobalEvent.onShowAlert, '必须是11位的手机号码');
//                }
//
//                if (!$scope.initPage.account && $scope.signUpObject.password.length < 6) {
//                    return $scope.$emit(GlobalEvent.onShowAlert, '密码必须大于6位数');
//                }
//
//                if ($scope.signUpObject.nickname === '') {
//                    return $scope.$emit(GlobalEvent.onShowAlert, '请输入店主名');
//                }
//
//                if ($scope.signUpObject.grocery_name === '') {
//                    return $scope.$emit(GlobalEvent.onShowAlert, '请输入店名');
//                }
//
//                if ($scope.signUpObject.grocery_area === '') {
//                    return $scope.$emit(GlobalEvent.onShowAlert, '请输入面积');
//                }
//
//                if ($scope.signUpObject.grocery_annual_sales === '') {
//                    return $scope.$emit(GlobalEvent.onShowAlert, '请输入年营业额');
//                }
//
//                if (!$scope.signUpObject.grocery_latitude || !$scope.signUpObject.grocery_longitude) {
//                    return $scope.$emit(GlobalEvent.onShowAlert, '请进行地图定位');
//                }
//
//                if ($scope.initPage.province === '' || $scope.initPage.city === '' || $scope.initPage.county === '') {
//                    return $scope.$emit(GlobalEvent.onShowAlert, '请选择地区');
//                }
//
//                $scope.signUpObject.district = $scope.initPage.province + '-' + $scope.initPage.city + '-' + $scope.initPage.county;
//
//                //if ($scope.signUpObject.grocery_photos.length === 0) {
//                //  return $scope.$emit(GlobalEvent.onShowAlert, '请上传店铺照片');
//                //}
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                if (!$scope.initPage.account) {
//                    SignService.grocerySignUp(
//                        $scope.signUpObject
//                    )
//                        .then(function (data) {
//                            console.log(data);
//                            $scope.$emit(GlobalEvent.onShowLoading, false);
//                            if (data.err) {
//                                $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                            }
//                            else if (data.error) {
//                                $scope.$emit(GlobalEvent.onShowAlert, data.error.type);
//
//                            }
//                            else {
//                                $scope.$emit(GlobalEvent.onShowAlert, '注册成功');
//                                initSignUpObject();
//                            }
//                        }, function (err) {
//                        });
//                }
//                else {
//                    $scope.signUpObject._id = $scope.initPage.account._id.toString();
//                    delete $scope.signUpObject.password;
//                    console.log('xiu gai:');
//                    console.log($scope.signUpObject);
//                    AccountServer.modifyGrocer(
//                        $scope.signUpObject
//                    )
//                        .then(function (data) {
//                            console.log(data);
//                            $scope.$emit(GlobalEvent.onShowLoading, false);
//                            if (data.err) {
//                                $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                            }
//                            else if (data.error) {
//                                $scope.$emit(GlobalEvent.onShowAlert, data.error.type);
//                            }
//                            else {
//                                $scope.$emit(GlobalEvent.onShowAlert, '修改成功');
//                                $state.go('grocersList');
//
//                            }
//                        }, function (err) {
//                        });
//                }
//
//            };
//
//            function initMap() {
//
//                $scope.initPage.map = BMapService.create('bmap', new BMap.Point(116.404, 39.915), 11, true);
//                $scope.initPage.map.addEventListener('moveend', function () {
//                    BMapService.refreshLocation($scope.initPage.map, function (addComp) {
//                        $scope.$apply(function () {
//                            $scope.initPage.search_key = BMapService.getAddressStrByMap(addComp);
//                        });
//                    });
//
//                });
//                initSearchInfo();
//
//            }
//
//            function initSearchInfo() {
//                var ac = new BMap.Autocomplete(    //建立一个自动完成的对象
//                    {
//                        'input': 'suggestId',
//                        'location': $scope.initPage.map
//                    });
//                ac.addEventListener('onhighlight', function (e) {
//                    var str = '';
//                    var _value = e.fromitem.value;
//                    var value = '';
//                    if (e.fromitem.index > -1) {
//                        value = _value.province + _value.city + _value.district + _value.street + _value.business;
//                    }
//                    str = 'FromItem<br />index = ' + e.fromitem.index + '<br />value = ' + value;
//
//                    value = '';
//                    if (e.toitem.index > -1) {
//                        _value = e.toitem.value;
//                        value = _value.province + _value.city + _value.district + _value.street + _value.business;
//                    }
//                    str += '<br />ToItem<br />index = ' + e.toitem.index + '<br />value = ' + value;
//                    getDomById('searchResultPanel').innerHTML = str;
//                });
//                var placeVal;
//                ac.addEventListener('onconfirm', function (e) {    //鼠标点击下拉列表后的事件
//                    var _value = e.item.value;
//                    placeVal = _value.province + _value.city + _value.district + _value.street + _value.business;
//                    getDomById('searchResultPanel').innerHTML = 'onconfirm<br />index = ' + e.item.index + '<br />placeVal = ' + placeVal;
//
//                    BMapService.setPlace(placeVal, $scope.initPage.map);
//                });
//            }
//
//            initAreaInfo();
//
//            getQiniuKey();
//
//            initDate();
//
//        }]);
