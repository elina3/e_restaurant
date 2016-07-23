/**
 * Created by elinaguo on 16/7/16.
 */
'use strict';
angular.module('EWeb').controller('MealBillController',
  ['$scope', '$window', '$stateParams', '$rootScope', 'GlobalEvent', '$state', 'Auth', 'BedMealRecordService', 'MealRecordService', 'GoodsService', 'MealTypeService',
    function ($scope, $window, $stateParams, $rootScope, GlobalEvent, $state, Auth, BedMealRecordService, MealRecordService, GoodsService, MealTypeService) {


      var defaultMealType = {id: '', text: '所有类型'};
      var mealTypes = [defaultMealType];
      $scope.pageData = {
        mealTags: [{id: '', text: '所有类型'},
          {id: 'breakfast', text: '早餐'},
          {id: 'lunch', text: '午餐'},
          {id: 'dinner', text: '晚餐'}],
        mealTypes: mealTypes,
        billStatuses: [{id: '', text: '所有类型'}, {id: 'un_paid', text: '未付款'}, {
          id: 'paid',
          text: '已付款'
        }, {id: 'prepare_to_pay', text: '未出账单'}, {id: 'canceled', text: '已取消'}],
        pagination: {
          currentPage: 1,
          limit: 20,
          totalCount: 0,
          skipCount: 0,
          onCurrentPageChanged: function (callback) {
            loadBills();
          }
        },
        datePicker: {
          createTimeRange: '',
          createTimeMinTime: moment().format('YY/MM/DD HH:mm'),
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
            timePicker: true,
            timePicker12Hour: false,
            timePickerIncrement: 1,
            separator: ' ~ ',
            format: 'YY/MM/DD HH:mm'
          }
        },
        bills: [],
        totalAmount: 0
      };

      function getTimeRangeString() {
        var timeRange = {};
        if ($scope.pageData.datePicker.createTimeRange) {
          if ($scope.pageData.datePicker.createTimeRange.startDate && $scope.pageData.datePicker.createTimeRange.startDate._d) {
            timeRange.startTime = moment($scope.pageData.datePicker.createTimeRange.startDate).toISOString();
          }
          if ($scope.pageData.datePicker.createTimeRange.endDate && $scope.pageData.datePicker.createTimeRange.endDate._d) {
            timeRange.endTime = moment($scope.pageData.datePicker.createTimeRange.endDate).toISOString();
          }
        }
        return JSON.stringify(timeRange);
      }

      function translateMealTag(mealTag) {
        var filterResult = $scope.pageData.mealTags.filter(function (item) {
          return item.id === mealTag;
        });
        if (filterResult.length === 0) {
          return '';
        }

        return filterResult[0].text;
      }

      function translateMealType(record) {
        var str = record.meal_type_name;
        record.meal_bills.forEach(function (item) {
          str += '(' + (item.name) + ':' + (item.price / 100) + '*' + item.count + '),';
        });
        if (str.substr(str.length - 1, 1) === ',') {
          str = str.substring(0, str.length - 1);
        }
        return str;
      }

      function loadBills() {
        MealRecordService.getMealBills({
          id_number: $scope.filter.currentIdNumber,
          meal_type_id: $scope.filter.currentMealType ? $scope.filter.currentMealType.id : '',
          meal_tag: $scope.filter.currentMealTag ? $scope.filter.currentMealTag.id : '',
          status: $scope.filter.currentBillStatus ? $scope.filter.currentBillStatus.id : '',
          time_range: getTimeRangeString(),
          current_page: $scope.pageData.pagination.currentPage,
          limit: $scope.pageData.pagination.limit,
          skip_count: $scope.pageData.pagination.skipCount
        }, function (err, data) {
          if (err || !data || !data.bed_meal_bills) {
            return $scope.$emit(GlobalEvent.onShowAlert, err || '查询失败');
          }

          $scope.pageData.bills = data.bed_meal_bills.map(function (item) {
            return {
              building: item.building,
              floor: item.floor,
              bed: item.bed,
              meal_set_date: item.meal_set_date,
              meal_tag: translateMealTag(item.meal_tag),
              meal_type_name: translateMealType(item),
              id_number: item.id_number,
              nickname: item.nickname,
              goods_bills: item.meal_bills,
              amount_paid: item.amount_paid,
              is_checkout: item.is_checkout
            };
          });

          $scope.pageData.totalAmount = data.total_amount;
          $scope.pageData.pagination.totalCount = data.total_count;
          $scope.pageData.pagination.limit = data.limit;
          $scope.pageData.pagination.pageCount = Math.ceil($scope.pageData.pagination.totalCount / $scope.pageData.pagination.limit);

        });
      }

      $scope.filter = {
        currentIdNumber: '',
        currentMealTag: null,
        currentMealType: null,
        currentBillStatus: null,
        search: function () {
          $scope.pageData.pagination.currentPage = 1;
          $scope.pageData.pagination.skipCount = 0;

          if (!$scope.pageData.datePicker.createTimeRange) {
            return $scope.$emit(GlobalEvent.onShowAlert, '请选择时间');
          }

          loadBills();
        }
      };

      $scope.translateMealType = function (bill) {

        return MealRecordService.translateMealType(bill);
      };

      $scope.goBack = function () {
        $window.history.back();
      };

      function init() {
        MealTypeService.getMealTypes(function (err, data) {
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err || !data || !data.meal_types) {
            return $scope.$emit(GlobalEvent.onShowAlert, err || '');
          }

          if (data.meal_types) {
            data.meal_types.forEach(function (item) {
              mealTypes.push({id: item._id, text: item.name});
            });
          }
        });
      }

      init();




      //<editor-fold desc="导出相关">
      var exportSheet = {A1: '日期', B1: '床位信息', C1: '姓名', D1: '身份证', E1: '营养餐', F1: '金额'};
      function generateExportData(row) {
        var result = [];
        result.push(row.time_tag);
        result.push(row.bed_info);
        result.push(row.nickname);
        result.push(row.id_number);
        result.push(row.meal_name);
        result.push(row.amount);
        return result;
      }
      function generateExcelDataArray(formattedStatisticInfos) {
        var datas = [];
        var header = [];
        for(var prop in exportSheet){
          header.push(exportSheet[prop]);
        }
        datas.push(header);
        for (var i = 0; i < formattedStatisticInfos.length; i++) {
          datas.push(generateExportData(formattedStatisticInfos[i]));
        }
        return datas;
      }
      function isIE() {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') !== -1) ? parseInt(myNav.split('msie')[1]) : false;
      }

      $scope.exportMealBills = function(){
        if (!$scope.pageData.datePicker.createTimeRange) {
          return $scope.$emit(GlobalEvent.onShowAlert, '请选择时间');
        }

        MealRecordService.exportMealBills({
          id_number: $scope.filter.currentIdNumber,
          meal_type_id: $scope.filter.currentMealType ? $scope.filter.currentMealType.id : '',
          meal_tag: $scope.filter.currentMealTag ? $scope.filter.currentMealTag.id : '',
          status: $scope.filter.currentBillStatus ? $scope.filter.currentBillStatus.id : '',
          time_range: getTimeRangeString()
        }, function (err, result) {
          if (err || !result || !result.bed_meal_bills) {
            return $scope.$emit(GlobalEvent.onShowAlert, err || '查询失败');
          }

          var mealBills = result.bed_meal_bills.map(function (item) {
            var billString = '';
            item.meal_bills.forEach(function(bill){
              billString += (bill.name +'*'+ bill.count+',');
            });
            return {
              time_tag: new Date(item.meal_set_date).Format('yyyy-MM-dd') + ' ' + translateMealTag(item.meal_tag),
              bed_info: item.building.name + item.floor.name + item.bed.name,
              nickname: item.nickname,
              id_number: item.id_number,
              meal_name: translateMealType(item),
              amount: item.amount_paid / 100
            };
          });

          if(mealBills.length === 0){
            return $scope.$emit(GlobalEvent.onShowAlert, '数据为空');
          }

          var data = generateExcelDataArray(mealBills);
          var workSheetName = 'Sheet1';
          if (isIE()) {
            var excel = new ActiveXObject('Excel.Application');
            var excel_book = excel.Workbooks.Add;
            var excel_sheet = excel_book.Worksheets(1);
            for (var i = 0; i < data.length; i++) {
              for (var j = 0; j < data[i].length; j++) {
                excel_sheet.Cells(i+1,j+1).Value = data[i][j];
              }
            }
            excel.Visible = true;
            excel.UserControl = true;
            $scope.$emit(GlobalEvent.onShowLoading, false);
          }
          else {
            var wookBook = new Workbook();
            var wookSheet = sheet_from_array_of_arrays(data);

            /* add worksheet to workbook */
            wookBook.SheetNames.push(workSheetName);
            wookBook.Sheets[workSheetName] = wookSheet;

            var wbout = XLSX.write(wookBook, {bookType: 'xlsx', bookSST: false, type: 'binary'});
            saveAs(new Blob([s2ab(wbout)], {type: 'application/octet-stream'}), '营养餐订单.xls');
            $scope.$emit(GlobalEvent.onShowLoading, false);
          }

        });
      };
      //</editor-fold>
    }]);
