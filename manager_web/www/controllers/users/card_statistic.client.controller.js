/**
 * Created by elinaguo on 16/5/15.
 */

'use strict';
angular.module('EWeb').controller('CardStatisticController',
  ['$rootScope', '$scope', 'GlobalEvent', '$state', 'CardStatisticService', 'Config', '$window', 'CardService', 'Auth', 'ExcelReadSupport',
    function ($rootScope, $scope, GlobalEvent, $state, CardStatisticService, Config, $window, CardService, Auth, ExcelReadSupport) {
      if (!Auth.getUser()) {
        $state.go('user_sign_in');
        return;
      }
      $scope.pageData = {
        keyword: '',
        action: {id: '', text: '不限'},
        formattedStatisticInfos: []
      };

      $scope.pageShow = {
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
          timePicker: false,
          timePicker12Hour: false,
          timePickerIncrement: 1,
          separator: ' ~ ',
          format: 'YY/MM/DD HH:mm'
        }
      };

      function loadCardStatistics() {
        $scope.$emit(GlobalEvent.onShowLoading, true);

        var filter = {
          startTimeStamp: -1,
          endTimeStamp: -1,
        };

        if ($scope.pageShow.createTimeRange) {
          if ($scope.pageShow.createTimeRange.startDate && $scope.pageShow.createTimeRange.startDate._d) {
            filter.startTimeStamp = $scope.pageShow.createTimeRange.startDate._d.getTime();
          }
          if ($scope.pageShow.createTimeRange.endDate && $scope.pageShow.createTimeRange.endDate._d) {
            filter.endTimeStamp = $scope.pageShow.createTimeRange.endDate._d.getTime();
          }
        }

        CardStatisticService.getAmountAndCountStatistics(filter, function (err, data) {
            if (err || !data) {
              $scope.$emit(GlobalEvent.onShowLoading, false);
              return $scope.$emit(GlobalEvent.onShowAlert, err);
            }

            $scope.formattedStatisticInfos = [];

            var beginTime = data.begin_time ? new Date(data.begin_time).Format('yyyy-MM-dd') : '-- ';
            var endTime = new Date(data.end_time).Format('yyyy-MM-dd');


            var obj = {}, sum= 0, prop = '';
            obj.name = '虚拟充值金额';
            for(prop in data.recharge_virtual.amount){
              sum += data.recharge_virtual.amount[prop];
              obj[prop] = data.recharge_virtual.amount[prop];

            }
            obj.sum = sum;
            obj.time = '';
            $scope.formattedStatisticInfos.push(obj);

            obj = {};
            sum = 0;
            obj.name = '现金充值金额';
            for(prop in data.recharge.amount){
              sum += data.recharge.amount[prop];
              obj[prop] = data.recharge.amount[prop];
            }
            obj.sum = sum;
            obj.time = '';
            $scope.formattedStatisticInfos.push(obj);

            obj = {};
            sum = 0;
            obj.name = '退卡金额';
            for(prop in data.close.amount){
              sum += data.close.amount[prop];
              obj[prop] = data.close.amount[prop];
            }
            obj.sum = sum;
            obj.time = '';
            $scope.formattedStatisticInfos.push(obj);

            obj = {};
            sum = 0;
            obj.name = '删除卡金额';
            for(prop in data.delete.amount){
              sum += data.delete.amount[prop];
              obj[prop] = data.delete.amount[prop];
            }
            obj.sum = sum;
            obj.time = '';
            $scope.formattedStatisticInfos.push(obj);


          $scope.formattedStatisticInfos.push({
            name: '小计',
            staff: '',
            expert: '',
            normal: '',
            sum: '',
            time: beginTime + '~' + endTime
          });


            obj = {};
            sum = 0;
            obj.name = '虚拟充值数量';
            for(prop in data.recharge_virtual.count){
              sum += data.recharge_virtual.count[prop];
              obj[prop] = data.recharge_virtual.count[prop];

            }
            obj.sum = sum;
            obj.time = '';
            $scope.formattedStatisticInfos.push(obj);

            obj = {};
            sum = 0;
            obj.name = '现金充值数量';
            for(prop in data.recharge.count){
              sum += data.recharge.count[prop];
              obj[prop] = data.recharge.count[prop];
            }
            obj.sum = sum;
            obj.time = '';
            $scope.formattedStatisticInfos.push(obj);
            obj = {};
            sum = 0;
            obj.name = '退卡数量';
            for(prop in data.close.count){
              sum += data.close.count[prop];
              obj[prop] = data.close.count[prop];
            }
            obj.sum = sum;
            obj.time = '';
            $scope.formattedStatisticInfos.push(obj);

            obj = {};
            sum = 0;
            obj.name = '删除卡数量';
            for(prop in data.delete.count){
              sum += data.delete.count[prop];
              obj[prop] = data.delete.count[prop];
            }
            obj.sum = sum;
            obj.time = '';
            $scope.formattedStatisticInfos.push(obj);

            $scope.formattedStatisticInfos.push({
              name: '小计',
              staff: '',
              expert: '',
              normal: '',
              sum: '',
              time: beginTime + '~' + endTime
            });

          $scope.$emit(GlobalEvent.onShowLoading, false);
            console.log(data);
          });
      }

      $scope.search = function(){
        loadCardStatistics();
      };
      $scope.goBack = function () {
        $window.history.back();
      };



      //<editor-fold desc="导出相关">
      var exportSheet = {A1: '类型', B1: '员工', C1: '专家', D1: '普通用户', E1: '合计', F1: '时间'};
      function generateExportData(row) {
        var result = [];
        result.push(row.name );
        result.push(row.staff);
        result.push(row.expert);
        result.push(row.normal);
        result.push(row.sum);
        result.push(row.time);
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
      $scope.export = function(){
        if($scope.formattedStatisticInfos.length === 0){
          return;
        }

        $scope.$emit(GlobalEvent.onShowLoading, true);

        var data = generateExcelDataArray($scope.formattedStatisticInfos);
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
          saveAs(new Blob([s2ab(wbout)], {type: 'application/octet-stream'}), '统计报表.xls');
          $scope.$emit(GlobalEvent.onShowLoading, false);
        }
      };
      //</editor-fold>

    }]);