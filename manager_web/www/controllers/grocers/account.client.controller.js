///**
// * Created by louisha on 15/7/7.
// */
//'use strict';
//angular.module('eWeb').controller('GrocerAcountListController',
//    ['$rootScope', '$scope', 'GlobalEvent', 'AccountServer', '$state',
//        function ($rootScope, $scope, GlobalEvent, AccountServer, $state) {
//
//            $scope.initPage = {
//                accountList: []
//            };
//
//            function getAccountList() {
//                $scope.$emit(GlobalEvent.onShowLoading, true);
//                AccountServer.getGrocerList().then(function (data) {
//                    $scope.$emit(GlobalEvent.onShowLoading, false);
//                    if (data.err) {
//                        $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                    }
//                    else {
//                        $scope.initPage.accountList = data.grocers;
//                    }
//
//
//                }, function (err) {
//                    console.log(err);
//                });
//            }
//
//            getAccountList();
//
//            $scope.onEdit = function (account) {
//                $state.go('grocerSignUp', {account: account._id});
//            };
//
//            $scope.onDelete = function (id) {
//                $scope.$emit(GlobalEvent.onShowAlertConfirm, {info: '是否确认删除？'}, function () {
//
//                    $scope.$emit(GlobalEvent.onShowLoading, true);
//                    AccountServer.deleteGrocer(id).then(function (data) {
//                        $scope.$emit(GlobalEvent.onShowLoading, false);
//                        if (data.err) {
//                            console.log(data.err);
//                            $scope.$emit(GlobalEvent.onShowAlert, data.err.type);
//                        }
//                        else if (data.error) {
//                            console.log(data.error);
//                            $scope.$emit(GlobalEvent.onShowAlert, data.error.type);
//                        }
//                        else if (data.success) {
//                            $scope.$emit(GlobalEvent.onShowAlert, '删除成功');
//                            getAccountList();
//                        } else {
//                            $scope.$emit(GlobalEvent.onShowAlert, '删除失败');
//                        }
//
//                    }, function (err) {
//                        console.log(err);
//                    });
//
//                });
//
//            };
//        }]);
