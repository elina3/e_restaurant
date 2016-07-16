/**
 * Created by elinaguo on 16/6/12.
 */
'use strict';
angular.module('EWeb').controller('SetMealController',
  ['$scope', '$window', '$stateParams', '$rootScope', 'GlobalEvent', '$state', 'Auth', 'BedService', 'BedMealRecordService', 'HospitalizedInfoService', 'BedMealBillService', 'MealTypeConstant',
    function ($scope, $window, $stateParams, $rootScope, GlobalEvent, $state, Auth, BedService, BedMealRecordService, HospitalizedInfoService, BedMealBillService, MealTypeConstant) {

      $scope.user = Auth.getUser();

      //var mealTypes = {
      //  healthy_normal: '普食',
      //  liquid_diets: '流质',
      //  semi_liquid_diets: '半流质',
      //  diabetic_diets: '糖尿病饮食',
      //  low_fat_low_salt_diets: '低脂低盐饮食'
      //};

      var defaultOption = [{id: '', text: '无'}];
      var breakfastMealTypes = defaultOption.concat(MealTypeConstant.breakfast_drop_menu_options);
      var lunchMealTypes = defaultOption.concat(MealTypeConstant.lunch_drop_menu_options);
      var dinnerMealTypes = defaultOption.concat(MealTypeConstant.dinner_drop_menu_options);

      $scope.timeout = true;

      $scope.filter = {
        currentBuilding: null,
        currentFloor: null,
        buildings: [],
        floors: [],
        breakfastMealTypes: breakfastMealTypes,
        lunchMealTypes: lunchMealTypes,
        dinnerMealTypes: dinnerMealTypes,
        //mealTypes: [
        //  {id: 'healthy_normal', text: mealTypes.healthy_normal},
        //  {id: 'liquid_diets', text: mealTypes.liquid_diets},
        //  {id: 'semi_liquid_diets', text: mealTypes.semi_liquid_diets},
        //  {id: 'diabetic_diets', text: mealTypes.diabetic_diets},
        //  {id: 'low_fat_low_salt_diets', text: mealTypes.low_fat_low_salt_diets}
        //]
      };

      $scope.changeBuilding = function () {
        if ($scope.filter.currentBuilding) {
          BedService.getFloorsByBuildingId($scope.filter.currentBuilding.id, function (err, data) {
            if (data && data.floors) {
              $scope.filter.floors = [];

              data.floors.forEach(function (floor) {
                $scope.filter.floors.push({
                  id: floor._id,
                  text: floor.name
                });
              });
            }
          });
        }
      };
      $scope.changeFloor = function () {
      };
      $scope.beds = [];

      function getBedByInfoBedId(bedId) {
        return $scope.beds.filter(function (item) {
          return item.id === bedId;
        })[0];
      }

      function getTimeStamp() {
        if ($scope.pageShow.createTimeRange.startDate && $scope.pageShow.createTimeRange.startDate._d) {
          var time = moment($scope.pageShow.createTimeRange.startDate);
          return new Date(time).getTime();
        }
        return;
      }

      function getNowTimeStamp() {
        var timeDate = new Date(new Date().toLocaleDateString() + ' 23:59:59');
        return new Date(timeDate).getTime();
      }

      function updateTimeout(timeStamp) {
        var today = getNowTimeStamp();
        if (today > timeStamp) {
          $scope.timeout = true;
        } else {
          $scope.timeout = false;
        }
      }

      $scope.search = function () {
        if (!$scope.filter.currentFloor) {
          return $scope.$emit(GlobalEvent.onShowAlert, '请选择楼层信息');
        }

        var timeStamp = getTimeStamp();
        if (!timeStamp) {
          return $scope.$emit(GlobalEvent.onShowAlert, '请选择时间！');
        }

        updateTimeout(timeStamp);

        $scope.$emit(GlobalEvent.onShowLoading, true);
        BedService.getBedsByFloorId($scope.filter.currentFloor.id, function (err, data) {
          if (data && data.beds) {
            $scope.beds = data.beds.map(function (item) {
              return {
                id: item._id,
                name: item.name,
                breakfast: null,
                lunch: null,
                dinner: null
              };
            });

            HospitalizedInfoService.searchHospitalizedInfoByFilter({
              building_id: $scope.filter.currentBuilding.id,
              floor_id: $scope.filter.currentFloor.id
            }, function (err, data) {
              if (data && data.hospitalized_infos) {
                data.hospitalized_infos.forEach(function (info) {
                  var bed = getBedByInfoBedId(info.bed._id);
                  if (bed) {
                    bed.hospitalized_info = {
                      id_number: info.id_number,
                      _id: info._id,
                      nickname: info.nickname
                    };
                  }
                });
              }

              function getMealTypeOption(mealTypeOptions, mealType) {
                var filters = mealTypeOptions.filter(function (item) {
                  return item.id === mealType;
                });
                return filters[0];
              }

              BedMealRecordService.getBedMealRecords({
                buildingId: $scope.filter.currentBuilding ? $scope.filter.currentBuilding.id : '',
                floorId: $scope.filter.currentFloor ? $scope.filter.currentFloor.id : '',
                timeStamp: timeStamp
              }, function (err, data) {
                $scope.$emit(GlobalEvent.onShowLoading, false);
                if (data.bed_meal_records) {
                  data.bed_meal_records.forEach(function (record) {
                    var bed = getBedByInfoBedId(record.bed);
                    if (bed) {
                      bed.bed_meal_record_id = record._id;
                      if (record.breakfast) {
                        bed.breakfast = getMealTypeOption(breakfastMealTypes, record.breakfast);
                      }
                      if (record.lunch) {
                        bed.lunch = getMealTypeOption(lunchMealTypes, record.lunch);
                      }
                      if (record.dinner) {
                        bed.dinner = getMealTypeOption(dinnerMealTypes, record.dinner);
                      }
                    }
                  });
                }
              });
            });
          }
        });
      };

      $scope.goBill = function () {
        $state.go('bed_meal_bill');
      };

      $scope.generateBill = function () {
        if ($scope.timeout) {
          return;
        }

        if (!$scope.filter.currentFloor) {
          return $scope.$emit(GlobalEvent.onShowAlert, '请选择楼层信息');
        }

        var timeStamp = getTimeStamp();
        if (!timeStamp) {
          return $scope.$emit(GlobalEvent.onShowAlert, '请选择时间！');
        }

        var bedMealRecordIds = [];
        var formattedBedMealInfos = $scope.beds.filter(function (bed) {
          if (bed.hospitalized_info && bed.bed_meal_record_id
          ) {
            if (bed.bed_meal_record_id) {
              bedMealRecordIds.push(bed.bed_meal_record_id);
            }
            return bed;
          }
        });

        if (formattedBedMealInfos.length === 0) {
          return $scope.$emit(GlobalEvent.onShowAlert, '请至少保存一个床位的用餐信息！');
        }

        $scope.$emit(GlobalEvent.onShowAlertConfirm,
          {
            title: '确认操作', content: '您确定要生成账单吗？如果确定，请确保您已保存刚才的更改', callback: function () {
            $scope.$emit(GlobalEvent.onShowLoading, true);
            BedMealBillService.batchCreateBills({
              bedMealRecordIds: bedMealRecordIds,
              buildingId: $scope.filter.currentBuilding.id,
              floorId: $scope.filter.currentFloor.id
            }, function (err, result) {
              $scope.$emit(GlobalEvent.onShowLoading, false);
              if (err) {
                return $scope.$emit(GlobalEvent.onShowAlert, err || '操作失败');
              }

              $scope.$emit(GlobalEvent.onShowAlert, '操作成功！');
            });
          }
          });
      };
      $scope.saveMealSet = function () {
        if ($scope.timeout) {
          return;
        }

        var formattedBedMealInfos = $scope.beds.filter(function (bed) {
          if (bed.hospitalized_info && (bed.breakfast || bed.lunch || bed.dinner)) {
            return bed;
          }
        });

        formattedBedMealInfos = formattedBedMealInfos.map(function (bed) {
          return {
            _id: bed.id,
            breakfast: bed.breakfast ? bed.breakfast.id : '',
            lunch: bed.lunch ? bed.lunch.id : '',
            dinner: bed.dinner ? bed.dinner.id : '',
            hospitalizedInfoId: bed.hospitalized_info._id
          };
        });

        if (formattedBedMealInfos.length === 0) {
          return $scope.$emit(GlobalEvent.onShowAlert, '请至少设置一个床位的用餐信息！');
        }

        var timeStamp = getTimeStamp();
        if (!timeStamp) {
          return $scope.$emit(GlobalEvent.onShowAlert, '请选择时间！');
        }

        $scope.$emit(GlobalEvent.onShowLoading, true);
        BedMealRecordService.saveBedMealRecords({
          buildingId: $scope.filter.currentBuilding ? $scope.filter.currentBuilding.id : '',
          floorId: $scope.filter.currentFloor ? $scope.filter.currentFloor.id : '',
          bedMealInfos: formattedBedMealInfos,
          timeStamp: timeStamp
        }, function (err, data) {
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err) {
            return $scope.$emit(GlobalEvent.onShowAlert, err || '保存失败');
          }

          if (data.bed_meal_records) {
            $scope.$emit(GlobalEvent.onShowAlert, '保存成功');
          }
          $scope.search();
          console.log(data);
        });
      };

      $scope.pageShow = {
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
      };

      $scope.goBack = function () {
        $window.history.back();
      };

      BedService.getBuildings(function (err, data) {
        if (data && data.buildings) {
          $scope.filter.buildings = [];
          data.buildings.forEach(function (building) {
            $scope.filter.buildings.push({id: building._id, text: building.name});
          });

          $scope.filter.currentBuilding = $scope.filter.buildings[0];
          $scope.changeBuilding();
        }
      });
    }]);
