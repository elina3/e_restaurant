/**
 * Created by elinaguo on 16/7/13.
 */
'use strict';
angular.module('EWeb').controller('MealSettingController',
  ['$scope', '$window', '$stateParams', '$rootScope', 'GlobalEvent', '$state', 'Auth', 'BedService', 'MealRecordService', 'HospitalizedInfoService', 'MealTypeService',
    function ($scope, $window, $stateParams, $rootScope, GlobalEvent, $state, Auth, BedService, MealRecordService, HospitalizedInfoService, MealTypeService) {
      //<editor-fold desc="更新当前时间">
      $scope.timeout = true;
      $scope.disableChange = false;
      function getNowTimeStamp() {
        var timeDate = new Date(new Date().toLocaleDateString() + ' 23:59:59');
        return new Date(timeDate).getTime();
      }

      function updateTimeout(timeStamp) {
        var today = getNowTimeStamp();
        if (today > timeStamp) {
          $scope.disableChange = true;
          $scope.timeout = true;
        } else {
          if(today < timeStamp){
            $scope.disableChange = true;
          }else{
            $scope.disableChange = false;
          }
            $scope.timeout = false;
        }
      }

      //</editor-fold>
      $scope.user = Auth.getUser();

      var defaultOption = {id: '', text: '无', price: 0};
      var mealTypes = {
        breakfast: [defaultOption],
        lunch: [defaultOption],
        dinner: [defaultOption]
      };

      var defaultBuilding = null;
      $scope.filter = {
        currentBuilding: null,
        currentFloor: null,
        buildings: [],
        floors: [],
        beds: [],
        timePanel: {
          createTimeRange: '',
          createTimeMinTime: moment().format('YY/MM/DD'),
          dateOptions: {
            locale: {
              fromLabel: '起始时间',
              toLabel: '结束时间',
              cancelLabel: '取消',
              applyLabel: '确定',
              customRangeLabel: '区间',
              daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
              firstDay: 1,
              monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月',
                '十月', '十一月', '十二月']
            },
            timePicker: false,
            timePicker12Hour: false,
            timePickerIncrement: 1,
            singleDatePicker: true,
            format: 'YYYY/MM/DD HH:mm'
          }
        },
        getTimeStamp: function () {
          if (this.timePanel.createTimeRange.startDate && this.timePanel.createTimeRange.startDate._d) {
            var time = moment(this.timePanel.createTimeRange.startDate);
            return new Date(time).getTime();
          }
          return;
        },
        changeBuilding: function () {
          if (this.currentBuilding) {
            var that = this;
            BedService.getFloorsByBuildingId(that.currentBuilding.id, function (err, data) {
              if (data && data.floors) {
                that.floors = [];

                data.floors.forEach(function (floor) {
                  that.floors.push({
                    id: floor._id,
                    text: floor.name
                  });
                });
              }
            });
          }
        }
      };

      $scope.changeBedPanel = {
        isShow: false,
        buildings: [],
        floors: [],
        beds: [],
        newBedInfo: {
          building: null,
          floor: null,
          bed: null
        },
        currentBedInfo: null,
        currentHospitalizedInfo: null,
        messageTip: '',
        show: function (bed, hospitalizedInfo) {
          if ($scope.disableChange) {
            return;
          }

          this.isShow = true;
          this.currentBedInfo = bed;
          this.currentHospitalizedInfo = hospitalizedInfo;

          this.newBedInfo.building = defaultBuilding;
        },
        hide: function () {
          this.isShow = false;
          this.reset();
        },
        saveValid: function () {
          this.messageTip = '';
          if (!this.newBedInfo.floor) {
            this.messageTip = '请选择楼';
            return false;
          }
          if (!this.newBedInfo.bed) {
            this.messageTip = '请选择床位';
            return false;
          }
          return true;
        },
        reset: function () {
          this.beds = [];
          this.newBedInfo.building = defaultBuilding;
          this.newBedInfo.floor = null;
          this.newBedInfo.bed = null;
          this.messageTip = '';
        },
        save: function () {
          var isSuccess = this.saveValid();
          if (!isSuccess) {
            return;
          }

          var timeStamp = $scope.filter.getTimeStamp();
          if (!timeStamp) {
            return $scope.$emit(GlobalEvent.onShowAlert, '请选择时间！');
          }

          var that = this;
          $scope.$emit(GlobalEvent.onShowLoading, true);
          MealRecordService.changeBed({
            bed_id: this.newBedInfo.bed.id,
            hospitalized_info_id: this.currentHospitalizedInfo._id,
            meal_set_time_stamp: timeStamp
          }, function (err, data) {
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if (err) {
              $scope.$emit(GlobalEvent.onShowAlert, err || '保存失败');
              return;
            }

            if (data.success) {
              $scope.$emit(GlobalEvent.onShowAlert, '保存成功');
              that.reset();
              that.hide();
              $scope.search();
            }
          });
        },
        changeBuilding: function () {
          if (this.currentBuilding) {
            var that = this;
            BedService.getFloorsByBuildingId(that.currentBuilding.id, function (err, data) {
              if (data && data.floors) {
                that.floors = [];

                data.floors.forEach(function (floor) {
                  that.floors.push({
                    id: floor._id,
                    text: floor.name
                  });
                });
              }
            });
          }
        },
        changeFloor: function () {
          if (this.newBedInfo.building && this.newBedInfo.floor) {
            var that = this;
            BedService.getBedsByFloorId(this.newBedInfo.floor.id, function (err, data) {
              if (err || !data || !data.beds) {
                return $scope.$emit(GlobalEvent.onShowAlert, err || '获取床位信息失败');
              }

              that.beds = data.beds.map(function (item) {
                return {
                  id: item._id,
                  text: item.name
                };
              });
            });
          }
        }
      };

      function getBedByInfoBedId(bedId) {
        return $scope.filter.beds.filter(function (item) {
          return item.id === bedId;
        })[0];
      }

      function getHospitalizedInfoIndex(hospitalizedInfos, idNumber) {
        var index = -1;
        hospitalizedInfos.forEach(function (item, i) {
          if (item.id_number === idNumber) {
            index = i;
          }
        });
        return index;
      }

      function loadBeds(callback) {
        BedService.getBedsByFloorId($scope.filter.currentFloor.id, function (err, data) {
          if (err || !data || !data.beds) {
            return callback(err || '获取床位信息失败');
          }

          $scope.filter.beds = data.beds.map(function (item) {
            return {
              id: item._id,
              name: item.name,
              hospitalized_infos: [{
                _id: '',
                id_number: '',
                nickname: '',
                breakfast: null,
                lunch: null,
                dinner: null,
                breakfastOptions: mealTypes.breakfast,
                lunchOptions: mealTypes.lunch,
                dinnerOptions: mealTypes.dinner,
              }],
              hasSicker: false
            };
          });
          return callback();
        });
      }

      function loadHospitalizedInfos(callback) {
        HospitalizedInfoService.searchHospitalizedInfoByFilter({
          building_id: $scope.filter.currentBuilding.id,
          floor_id: $scope.filter.currentFloor.id
        }, function (err, data) {
          if (err || !data || !data.hospitalized_infos) {
            return callback(err || '获取入住信息失败');
          }

          data.hospitalized_infos.forEach(function (info) {
            var bed = getBedByInfoBedId(info.bed._id);
            if (bed) {
              if (!bed.hospitalized_infos) {
                bed.hospitalized_infos = [];
              }

              var index = getHospitalizedInfoIndex(bed.hospitalized_infos, info.id_number);
              if (index === -1) {
                if (!bed.hasSicker) {
                  index = 0;
                } else {
                  index = bed.hospitalized_infos.length - 1;
                }

                bed.hospitalized_infos[index]._id = info._id;
                bed.hospitalized_infos[index].id_number = info.id_number;
                bed.hospitalized_infos[index].nickname = info.nickname;
                bed.hasSicker = true;
              }
            }
          });
          return callback();
        });
      }

      function getMealTypeIndex(mealTypes, mealTypeId) {
        var index = -1;
        mealTypes.forEach(function (item, i) {
          if (item.id === mealTypeId) {
            index = i;
          }
        });
        return index;
      }

      function loadMealSettingRecords(timeStamp, callback) {
        MealRecordService.getMealRecords({
          meal_set_time_stamp: timeStamp,
          building_id: $scope.filter.currentBuilding ? $scope.filter.currentBuilding.id : '',
          floor_id: $scope.filter.currentFloor ? $scope.filter.currentFloor.id : ''
        }, function (err, data) {
          if (err || !data || !data.bed_meal_records) {
            return callback(err || '获取设置信息失败');
          }

          data.bed_meal_records.forEach(function (record) {
            var bed = getBedByInfoBedId(record.bed);
            if (bed) {
              if (!bed.hospitalized_infos) {
                bed.hospitalized_infos = [];
              }
              var index = getHospitalizedInfoIndex(bed.hospitalized_infos, record.id_number);
              if (index === -1) {
                if (!bed.hasSicker) {
                  index = 0;
                } else {
                  index = bed.hospitalized_infos.length;
                  bed.hospitalized_infos[index] = {};
                }
                bed.hospitalized_infos[index]._id = record.hospitalized_info;
                bed.hospitalized_infos[index].id_number = record.id_number;
                bed.hospitalized_infos[index].nickname = record.nickname;
                bed.hasSicker = true;

              }

              var mealType = {
                id: '',
                text: '无'
              };
              if(record.meal_type_id){
                mealType = {
                  id: record.meal_type_id,
                  text: (record.meal_type_name + '(' + (record.meal_type_price / 100) + ')')
                };
              }
              var currentHospitalizedInfo = bed.hospitalized_infos[index];
              currentHospitalizedInfo.is_checkout = record.is_checkout;
              currentHospitalizedInfo[record.meal_tag] = mealType;
              if (!currentHospitalizedInfo[record.meal_tag + 'Options']) {
                currentHospitalizedInfo[record.meal_tag + 'Options'] = [];
              }
              var mealTypeIndex = getMealTypeIndex(currentHospitalizedInfo[record.meal_tag + 'Options'], mealType.id);
              if (mealTypeIndex === -1) {
                mealType.disabled = true;
                currentHospitalizedInfo[record.meal_tag + 'Options'].push(mealType);
              }
            }
          });
          return callback();
        });
      }

      function loadNormalRecords(timeStamp) {
        $scope.$emit(GlobalEvent.onShowLoading, true);
        loadHospitalizedInfos(function (err) {
          if (err) {
            $scope.$emit(GlobalEvent.onShowLoading, false);
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }
          loadMealSettingRecords(timeStamp, function (err) {
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if (err) {
              return $scope.$emit(GlobalEvent.onShowAlert, err);
            }
          });
        });
      }

      function loadHistoryRecords(timeStamp) {
        $scope.$emit(GlobalEvent.onShowLoading, true);
        loadMealSettingRecords(timeStamp, function (err) {
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err) {
            return $scope.$emit(GlobalEvent.onShowAlert);
          }
        });
      }

      var currentTimeStamp = null;

      $scope.search = function () {

        if (!$scope.filter.currentFloor) {
          return $scope.$emit(GlobalEvent.onShowAlert, '请选择楼层信息');
        }

        var timeStamp = $scope.filter.getTimeStamp();
        if (!timeStamp) {
          return $scope.$emit(GlobalEvent.onShowAlert, '请选择时间！');
        }

        updateTimeout(timeStamp);
        $scope.$emit(GlobalEvent.onShowLoading, true);
        loadBeds(function (err) {
          if (err) {
            $scope.$emit(GlobalEvent.onShowLoading, false);
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          if ($scope.timeout) {
            loadHistoryRecords(timeStamp);
          } else {
            loadNormalRecords(timeStamp);
          }

          currentTimeStamp = timeStamp;
        });
      };

      $scope.selectChangeByHospitalizedInfo = function(hospitalizedInfo){
        hospitalizedInfo.changed = true;
      };

      function prepareParams() {
        var validBedSettings = $scope.filter.beds.filter(function (item) {
          var settings = item.hospitalized_infos.filter(function (subItem) {
            return subItem._id && !subItem.is_checkout && (subItem.changed || (subItem.breakfast && subItem.breakfast.id || (subItem.lunch && subItem.lunch.id) || (subItem.dinner && subItem.dinner.id)));
          });

          return item.hasSicker && settings.length > 0;
        });

        var infos = [];
        var hospitalizedIds = [];
        validBedSettings.forEach(function (bedItem) {
          bedItem.hospitalized_infos.forEach(function (subItem) {
            if (subItem._id && !subItem.is_checkout) {
              if (hospitalizedIds.indexOf(subItem._id) === -1) {
                hospitalizedIds.push(subItem._id);
              }
              if (subItem.breakfast) {
                infos.push({
                  bed_id: bedItem.id,
                  hospitalizedInfoId: subItem._id,
                  mealTypeId: subItem.breakfast.id,
                  mealTag: 'breakfast'
                });
              }
              if (subItem.lunch) {
                infos.push({
                  bed_id: bedItem.id,
                  hospitalizedInfoId: subItem._id,
                  mealTypeId: subItem.lunch.id,
                  mealTag: 'lunch'
                });
              }
              if (subItem.dinner) {
                infos.push({
                  bed_id: bedItem.id,
                  hospitalizedInfoId: subItem._id,
                  mealTypeId: subItem.dinner.id,
                  mealTag: 'dinner'
                });
              }
            }
          });
        });

        return {
          hospitalized_info_ids: hospitalizedIds,
          bed_meal_record_infos: infos
        };
      }

      $scope.saveMealSet = function () {
        if ($scope.timeout) {
          return;
        }

        var timeStamp = $scope.filter.getTimeStamp();
        if (!timeStamp) {
          return $scope.$emit(GlobalEvent.onShowAlert, '请选择时间！');
        }

        if(timeStamp !== currentTimeStamp){
          return $scope.$emit(GlobalEvent.onShowAlert, '您的时间已变更，请先筛选查看再来决定是否生成账单！');
        }

        var bedMealRecordParams = prepareParams();
        if (bedMealRecordParams.bed_meal_record_infos.length === 0) {
          return $scope.$emit(GlobalEvent.onShowAlert, '请至少设置一个床位的用餐信息！');
        }

        $scope.$emit(GlobalEvent.onShowLoading, true);
        MealRecordService.batchSave({
          bed_meal_record_infos: bedMealRecordParams.bed_meal_record_infos,
          meal_set_time_stamp: timeStamp,
          building_id: $scope.filter.currentBuilding ? $scope.filter.currentBuilding.id : '',
          floor_id: $scope.filter.currentFloor ? $scope.filter.currentFloor.id : '',
          hospitalized_info_ids: bedMealRecordParams.hospitalized_info_ids
        }, function (err, data) {
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err || !data) {
            return $scope.$emit(GlobalEvent.onShowAlert, err || '保存失败');
          }

          $scope.$emit(GlobalEvent.onShowAlert, '保存成功，成功保存' + data.success_count + '条记录，已存在记录' + data.exist_count);
          $scope.search();
        });
      };

      $scope.copyPrevious = function(){


        var timeStamp = $scope.filter.getTimeStamp();
        if (!timeStamp) {
          return $scope.$emit(GlobalEvent.onShowAlert, '请选择时间！');
        }

        if(timeStamp !== currentTimeStamp){
          return $scope.$emit(GlobalEvent.onShowAlert, '您的时间已变更，请先筛选查看再来决定是否顺延前一天的设置！');
        }

        if ($scope.timeout) {
          return;
        }

        $scope.$emit(GlobalEvent.onShowAlertConfirm,
          {
            title: '确认操作', content: '顺延前一天，当天的设置将被替换，您确定要顺延吗？',
            callback: function () {
            $scope.$emit(GlobalEvent.onShowLoading, true);
            MealRecordService.copyPreviousSetting({
              meal_set_time_stamp: timeStamp,
              building_id: $scope.filter.currentBuilding ? $scope.filter.currentBuilding.id : '',
              floor_id: $scope.filter.currentFloor ? $scope.filter.currentFloor.id : ''
            }, function (err, data) {
              $scope.$emit(GlobalEvent.onShowLoading, false);
              if (err || !data) {
                return $scope.$emit(GlobalEvent.onShowAlert, err || '顺延失败失败');
              }

              $scope.$emit(GlobalEvent.onShowAlert, '顺延成功！');
              $scope.search();
            });
          }
          });

      };

      $scope.goBack = function () {
        $window.history.back();
      };

      $scope.goBill = function () {
        $state.go('meal_bill');
      };

      $scope.goMealType = function(){
        $state.go('meal_type');
      };

      function init() {
        BedService.getBuildings(function (err, data) {
          if (data && data.buildings) {
            $scope.filter.buildings = [];
            data.buildings.forEach(function (building) {
              $scope.filter.buildings.push({id: building._id, text: building.name});
              $scope.changeBedPanel.buildings.push({id: building._id, text: building.name});
            });

            defaultBuilding = $scope.filter.buildings[0];
            $scope.filter.currentBuilding = defaultBuilding;
            $scope.changeBedPanel.currentBuilding = defaultBuilding;

            $scope.filter.changeBuilding();
            $scope.changeBedPanel.changeBuilding();
          }
        });
        MealTypeService.getMealTypes(function (err, data) {
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err || !data || !data.meal_types) {
            return $scope.$emit(GlobalEvent.onShowAlert, err || '');
          }

          if (data.meal_types) {
            data.meal_types.forEach(function (item) {
              mealTypes.breakfast.push({
                id: item._id,
                text: item.name + '(' + (amountParse(item.breakfast_price) / 100) + ')',
                price: item.breakfast_price
              });
              mealTypes.lunch.push({
                id: item._id,
                text: item.name + '(' + (amountParse(item.lunch_price) / 100) + ')',
                price: item.lunch_price
              });
              mealTypes.dinner.push({
                id: item._id,
                text: item.name + '(' + (amountParse(item.dinner_price) / 100) + ')',
                price: item.dinner_price
              });
            });
          }
        });
      }

      init();
    }]);
