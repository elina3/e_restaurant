///**
// * Created by louisha on 15/7/10.
// */
//'use strict';
//angular.module('eWeb').controller('GrocerHometController',
//    ['$scope', 'GlobalEvent', 'SignService', 'Config', '$state', 'EnvironmentService', 'DownloadService',
//        function ($scope, GlobalEvent, SignService, Config, $state, EnvironmentService, DownloadService) {
//
//            $scope.initPage = {
//                downloadAndroidLink: DownloadService.GROCER_ANDROID_LINK,
//                downloadIOSLink: DownloadService.groceyIosLink(),
//                downloadDistributorAndroidLink: DownloadService.DISTRIBUTOR_ANDROID_LINK,
//                downloadDistributorIOSLink: DownloadService.distributorIosLink(),
//                downloadDeliveryAndroidLink: DownloadService.DELIVERY_ANDROID_LINK,
//                downloadDeliveryIOSLink: DownloadService.deliveryIosLink(),
//                ercode_img: ''
//            };
//            $scope.signInConfig = {
//                username: '',
//                password: ''
//            };
//            $scope.goDistributorSignIn = function () {
//                $state.go('distributorSignIn');
//            };
//            $scope.signIn = function () {
//                if (!$scope.signInConfig.username || !$scope.signInConfig.password) {
//                    return $scope.$emit(GlobalEvent.onShowAlert, '请输入用户名或密码');
//                }
//                if ($scope.signInConfig.password.length < 6) {
//                    return $scope.$emit(GlobalEvent.onShowAlert, '密码不能少于6位');
//
//                }
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                SignService.grocerySignIn($scope.signInConfig.username, $scope.signInConfig.password).then(function (data) {
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    console.log(data);
//                    if (data.err) {
//                        return $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                    }
//                    if (data.error) {
//                        return $scope.$emit(GlobalEvent.onShowAlert, data.error.type);
//                    }
//                    window.location = Config.serverAddress + '/grocery/#/home/' + data.access_token;
//                }, function (err) {
//                    console.log(err);
//                    return $scope.$emit(GlobalEvent.onShowAlert, '登录失败，网络错误');
//                });
//            };
//
//            function closeLoading(inx) {
//                if (inx <= 0) {
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                }
//            }
//
//            function init() {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                var request_inx = 3;
//                DownloadService.getGroceryAppInfo(function (err, data) {
//                    if (err) {
//                        console.log(err.type);
//                    }
//                    request_inx--;
//                    closeLoading(request_inx);
//                    $scope.initPage.downloadIOSLink = DownloadService.groceyIosLink();
//                });
//
//                DownloadService.getDistributorAppInfo(function (err, data) {
//                    if (err) {
//                        console.log(err.type);
//                    }
//                    request_inx--;
//                    closeLoading(request_inx);
//                    $scope.initPage.downloadDistributorIOSLink = DownloadService.distributorIosLink();
//                });
//
//                DownloadService.getDeliveryAppInfo(function (err, data) {
//                    if (err) {
//                        console.log(err.type);
//                    }
//                    request_inx--;
//                    closeLoading(request_inx);
//                    $scope.initPage.downloadDeliveryIOSLink = DownloadService.deliveryIosLink();
//                });
//            }
//
//            $scope.downloadIos = function (type) {
//                var _link = '';
//                switch (type) {
//                    case 'shop':
//                        _link = $scope.initPage.downloadIOSLink;
//                        break;
//                    case 'distributor':
//                        _link = $scope.initPage.downloadDistributorIOSLink;
//                        break;
//                    case 'delivery':
//                        _link = $scope.initPage.downloadDeliveryIOSLink;
//                        break;
//
//                }
//                window.open(_link);
//            };
//
//            init();
//
//        }]);
