/**
 * Created by elinaguo on 16/6/23.
 */

'use strict';
angular.module('EWeb').controller('HospitalizedInfoController',
  ['$scope', '$window', 'GlobalEvent', '$state', 'Auth', 'BedService', 'BedMealRecordService', 'HospitalizedInfoService', 'BedMealBillService',
    function ($scope, $window, GlobalEvent, $state, Auth, BedService, BedMealRecordService, HospitalizedInfoService, BedMealBillService) {

      $scope.user = Auth.getUser();


      function validIdNumber(idNumberString) {
        idNumberString = idNumberString.toUpperCase();
        if (/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(idNumberString)) {
          return true;
        }
        return false;
      }

      var defaultBuilding;
      var sexes = [{id: 'female', text: '女'}, {id: 'male', text: '男'}, {id: 'unknown', text: '未知'}];

      $scope.panelConfig = {
        isShow: false,
        buildings: [],
        floors: [],
        beds: [],
        sexes: sexes,
        newSicker: {
          building: null,
          floor: null,
          bed: null,
          idNumber: '',
          nickname: '',
          sex: null,
          phone: ''
        },
        messageTip: '',
        show: function () {
          this.isShow = true;
        },
        hide: function () {
          this.isShow = false;
        },
        saveValid: function () {
          this.messageTip = '';
          if (!this.newSicker.floor) {
            this.messageTip = '请选择楼层';
            return false;
          }
          if (!this.newSicker.bed) {
            this.messageTip = '请选择楼层';
            return false;
          }
          if (!this.newSicker.idNumber) {
            this.messageTip = '请输入身份证号';
            return false;
          }
          if (!validIdNumber(this.newSicker.idNumber)) {
            this.messageTip = '请输入有效身份证号';
            return false;
          }
          if (!this.newSicker.nickname) {
            this.messageTip = '请输入姓名';
            return false;
          }
          if (!this.newSicker.sex) {
            this.messageTip = '请选择性别';
            return false;
          }
          return true;
        },
        reset: function () {
          this.beds = [];
          this.newSicker.building = defaultBuilding;
          this.newSicker.floor = null;
          this.newSicker.bed = null;
          this.newSicker.idNumber = '';
          this.newSicker.nickname = '';
          this.newSicker.sex = null;
          this.newSicker.phone = '';
          this.messageTip = '';
        },
        save: function () {
          var isSuccess = this.saveValid();
          if (!isSuccess) {
            return;
          }

          $scope.$emit(GlobalEvent.onShowLoading, true);
          HospitalizedInfoService.createNewHospitalizedInfo({
            buildingId: this.newSicker.building.id,
            floorId: this.newSicker.floor.id,
            bedId: this.newSicker.bed.id,
            sickerInfo: {
              idNumber: this.newSicker.idNumber,
              nickname: this.newSicker.nickname,
              phone: this.newSicker.phone,
              sex: this.newSicker.sex.id
            }
          }, function (err, data) {

            $scope.$emit(GlobalEvent.onShowLoading, false);
            if (err) {
              $scope.$emit(GlobalEvent.onShowAlert, err || '保存失败');
              return;
            }

            if (data.success) {
              $scope.$emit(GlobalEvent.onShowAlert, '保存成功');
              $scope.panelConfig.reset();
              $scope.panelConfig.hide();
            }
          });
        }
      };
      $scope.filter = {
        currentIdNumber: '',
        search: function () {
          //if (!this.currentIdNumber) {
          //  return $scope.$emit(GlobalEvent.onShowAlert, '请输入身份证号');
          //}
          if (this.currentIdNumber && !validIdNumber(this.currentIdNumber)) {
            return $scope.$emit(GlobalEvent.onShowAlert, '请输入有效身份证号');
          }

          $scope.$emit(GlobalEvent.onShowLoading, true);
          HospitalizedInfoService.searchHospitalizedInfoByIdNumber({
            idNumber: this.currentIdNumber
          }, function (err, data) {

            $scope.$emit(GlobalEvent.onShowLoading, false);
            if (err) {
              $scope.$emit(GlobalEvent.onShowAlert, err || '查询失败');
              return;
            }

            if (data.hospitalized_infos) {
              $scope.hospitalized_infos = data.hospitalized_infos.map(function (item) {
                return {
                  _id: item._id,
                  building: item.building,
                  floor: item.floor,
                  bed: item.bed,
                  nickname: item.nickname,
                  sex: item.sex,
                  phone: item.phone,
                  is_hospitalized: item.is_hospitalized,
                  hospitalized_time: item.hospitalized_time,
                  is_leave_hospital: item.is_leave_hospital,
                  leave_hospital_time: item.leave_hospital_time
                };
              });
              if ($scope.hospitalized_infos.length > 0) {
                $scope.id_number_info.hospitalized_info_id = $scope.hospitalized_infos[0]._id;
                $scope.id_number_info.nickname = $scope.hospitalized_infos[0].nickname;
                $scope.id_number_info.sex = $scope.hospitalized_infos[0].sex;
                $scope.id_number_info.phone = $scope.hospitalized_infos[0].phone;
              }
            }
          });
        },
        currentHospitalizedInfo: null
      };
      $scope.hospitalized_infos = [];
      $scope.id_number_info = {
        nickname: '',
        sex: '',
        phone: '',
        transformSex: function (sexString) {
          var result = '';
          switch (sexString) {
            case 'female':
              result = '女';
              break;
            case 'male':
              result = '男';
              break;
            case 'unknown':
              result = '未知';
              break;
          }

          return result;

        }
      };
      $scope.current_bills = [];
      $scope.current_bill_money = {
        paidAmount: 0,
        unPaidAmount: 0,
        prepareToPayAmount: 0
      };

      function getFloorsByBuilding(building, callback) {
        BedService.getFloorsByBuildingId(building.id, function (err, data) {
          if (data && data.floors) {
            var floors = data.floors.map(function (item) {
              return {
                id: item._id,
                text: item.name
              };
            });
            return callback(null, floors);
          }
          return callback('请求数据失败，请刷新页面重试');
        });
      }

      function getBedsByFloor(floor, callback) {
        BedService.getBedsByFloorId(floor.id, function (err, data) {
          if (data && data.beds) {
            var beds = data.beds.map(function (item) {
              return {
                id: item._id,
                text: item.name
              };
            });
            return callback(null, beds);
          }
          return callback('请求数据失败，请刷新页面重试');
        });
      }

      $scope.panelBuildingChange = function () {
        if ($scope.panelConfig.newSicker.building) {
          getFloorsByBuilding($scope.panelConfig.newSicker.building, function (err, floors) {
            if (!err) {
              $scope.panelConfig.floors = floors;
            }
          });
        }
      };
      $scope.panelFloorChange = function () {
        if ($scope.panelConfig.newSicker.floor) {
          getBedsByFloor($scope.panelConfig.newSicker.floor, function (err, beds) {
            if (!err) {
              $scope.panelConfig.beds = beds;
            }
          });
        }
      };

      function init() {
        BedService.getBuildings(function (err, data) {
          if (data && data.buildings) {
            var buildings = data.buildings.map(function (item) {
              return {
                id: item._id,
                text: item.name
              };
            });
            $scope.panelConfig.buildings = buildings;

            defaultBuilding = buildings[0];
            $scope.panelConfig.newSicker.building = defaultBuilding;
            $scope.panelBuildingChange();
          }
        });
      }

      init();

      //阻止事件冒泡
      function stopBubble(e) {
        if (e && e.stopPropagation)
          e.stopPropagation(); //非IE
        else
          window.event.cancelBubble = true; //IE
      }

      $scope.translateMealTag = function (mealTag) {

        switch (mealTag) {
          case 'breakfast':
            return '早餐';
          case 'lunch':
            return '午餐';
          case 'dinner':
            return '晚餐';
        }

        return '';
      };

      $scope.translateMealType = function (bill) {
        return BedMealBillService.translateMealType(bill);
      };

      function updateBills(data) {
        var now = new Date();
        $scope.current_bill_money.paidAmount = 0;
        $scope.current_bill_money.unPaidAmount = 0;
        $scope.current_bill_money.prepareToPayAmount = 0;

        if (data.bed_meal_bills) {
          $scope.current_bills = data.bed_meal_bills.map(function (item) {

            var isPrepareToPay = (!item.is_checkout && (new Date(item.meal_set_date) > now));
            if(isPrepareToPay){
              if(!item.is_cancel){
                $scope.current_bill_money.prepareToPayAmount += item.amount_paid;
              }
            }else if(!item.is_checkout){
              $scope.current_bill_money.unPaidAmount += item.amount_paid;
            }else{
              $scope.current_bill_money.paidAmount += item.amount_paid;
            }

            return {
              bed_meal_record: item.bed_meal_record,
              meal_set_date: item.meal_set_date,
              meal_tag: item.meal_tag,
              meal_type: item.meal_type,
              amount_paid: item.amount_paid,
              is_checkout: item.is_checkout,
              status: item.is_cancel ? '已取消' : (isPrepareToPay ? '未出单' : (item.is_checkout ? '已付款' : '未付款')),
              goods_bills: item.goods_bills
            };
          });
        }


        if (data.bed_meal_bills.length === 0) {
          $scope.noResultTip = '没有任何数据';
        } else {
          $scope.noResultTip = '';
        }
      }

      $scope.getBedMealBills = function (info) {
        if (!info) {
          return;
        }

        $scope.hospitalized_infos.forEach(function (item) {
          item.selected = false;
        });

        info.selected = true;
        $scope.pageConfig.currentHospitalizedInfo = info;

        $scope.$emit(GlobalEvent.onShowLoading, true);
        BedMealBillService.querySickerBedMealBillsByFilter({
          hospitalizedInfoId: info._id,
          status: 'all'
        }, function (err, data) {

          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err) {
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          updateBills(data);

        });
      };
      $scope.leaveHospital = function (info, $event) {
        $scope.$emit(GlobalEvent.onShowAlertConfirm,
          {
            title: '确认操作', content: '您确定要办理出院手续吗？', callback: function () {
            $scope.$emit(GlobalEvent.onShowLoading, true);
            HospitalizedInfoService.leaveHospital({
              hospitalizedInfoId: info._id
            }, function (err, data) {

              $scope.$emit(GlobalEvent.onShowLoading, false);
              if (err) {
                $scope.$emit(GlobalEvent.onShowAlert, err || '保存失败');
                return;
              }

              if (data.success) {
                $scope.filter.search();
                $scope.$emit(GlobalEvent.onShowAlert, '保存成功');
              }
            });
          }
          });
        stopBubble($event);
      };
      $scope.pay = function () {
        $scope.$emit(GlobalEvent.onShowAlertConfirm,
          {
            title: '确认操作', content: '您确定要开始结算吗？', callback: function () {
            $scope.$emit(GlobalEvent.onShowLoading, true);
            BedMealBillService.pay({
              hospitalized_info_id: $scope.pageConfig.currentHospitalizedInfo._id
            }, function (err, data) {
              $scope.$emit(GlobalEvent.onShowLoading, false);
              if (err || !data) {
                return $scope.$emit(GlobalEvent.onShowAlert, err || '清算失败');
              }

              if (data.bed_meal_bills) {
                $scope.$emit(GlobalEvent.onShowAlert, '清算成功，总金额' + data.amount_paid / 100 + '，共' + data.checkout_count + '笔。');
                updateBills(data);
              }
            });
          }
          });
      };
      $scope.goBack = function () {
        $window.history.back();
      };
    }]);
