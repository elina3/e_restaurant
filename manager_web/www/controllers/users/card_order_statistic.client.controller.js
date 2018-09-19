/**
 * Created by elinaguo on 16/5/15.
 */

'use strict';
angular.module('EWeb').controller('CardOrderStatisticController',
  ['$rootScope', '$scope', 'GlobalEvent', '$state', 'OrderService', 'Config', '$window', 'Auth', 'ExcelReadSupport',
    function ($rootScope, $scope, GlobalEvent, $state, OrderService, Config, $window, Auth, ExcelReadSupport) {

      $scope.user = Auth.getUser();

      if (!$scope.user) {
        $state.go('user_sign_in');
        return;
      }
      $scope.pageData = {
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

      function loadOrderStatistics() {
        $scope.$emit(GlobalEvent.onShowLoading, true);


        var timeRange = {};
        if($scope.pageShow.createTimeRange){
          if($scope.pageShow.createTimeRange.startDate && $scope.pageShow.createTimeRange.startDate._d){
            timeRange.startTime = moment($scope.pageShow.createTimeRange.startDate).toISOString();
          }
          if($scope.pageShow.createTimeRange.endDate && $scope.pageShow.createTimeRange.endDate._d){
            timeRange.endTime = moment($scope.pageShow.createTimeRange.endDate).toISOString();
          }
        }
        var timeRangeString = JSON.stringify(timeRange);

        //OrderService.getOrderStatisticByTimeTagGroup(timeRangeString, function (err, data) {
        OrderService.getCardOrderStatisticByUserRole(timeRangeString, function (err, data) {
            if (err || !data) {
              $scope.$emit(GlobalEvent.onShowLoading, false);
              return $scope.$emit(GlobalEvent.onShowAlert, err);
            }

            $scope.formattedStatisticInfos = [];

            var beginTime = data.begin_time ? new Date(data.begin_time).Format('yyyy-MM-dd') : '-- ';
            var endTime = new Date(data.end_time).Format('yyyy-MM-dd');

            console.log(data);
          var dinner = {
            time_tag: '普通卡',
            order_count: '',
            order_total_price: '',
            order_actual_amount: ''
          }, lunch={
            time_tag: '员工卡',
            order_count: '',
            order_total_price: '',
            order_actual_amount: '',
            date: ''
          }, breakfast={
            time_tag: '专家卡',
            order_count: '',
            order_total_price: '',
            order_actual_amount: '',
            date: ''
          }, summary = {
            time_tag: '合计',
            order_count: '',
            order_total_price: '',
            order_actual_amount: '',
            date: beginTime + '~' + endTime
          };

            if(data.order_statistic && data.order_statistic.length > 0){
              summary.order_count = 0;
              summary.order_total_price = 0;
              summary.order_actual_amount = 0;
              data.order_statistic.forEach(function(group){
                if(group._id === '晚餐'){
                  dinner.order_count = group.order_count;
                  dinner.order_total_price = group.order_total_price.toFixed(3);
                  dinner.order_actual_amount = group.order_actual_amount.toFixed(3);
                }

                if(group._id === '午餐'){
                  lunch.order_count = group.order_count;
                  lunch.order_total_price = group.order_total_price.toFixed(3);
                  lunch.order_actual_amount = group.order_actual_amount.toFixed(3);
                }

                if(group._id === '早餐'){
                  breakfast.order_count = group.order_count;
                  breakfast.order_total_price = group.order_total_price.toFixed(3);
                  breakfast.order_actual_amount = group.order_actual_amount.toFixed(3);
                }

                summary.order_count += group.order_count;
                summary.order_total_price += parseFloat(group.order_total_price);
                summary.order_actual_amount += parseFloat(group.order_actual_amount);

              });

              summary.order_total_price = summary.order_total_price.toFixed(3);
              summary.order_actual_amount = summary.order_actual_amount.toFixed(3);
            }


          $scope.formattedStatisticInfos.push(breakfast);
          $scope.formattedStatisticInfos.push(lunch);
          $scope.formattedStatisticInfos.push(dinner);
          $scope.formattedStatisticInfos.push(summary);



          $scope.$emit(GlobalEvent.onShowLoading, false);
            console.log(data);
          });
      }

      $scope.search = function(){
        loadOrderStatistics();
      };
      $scope.goBack = function () {
        $window.history.back();
      };



      //<editor-fold desc="导出相关">
      var exportSheet = {A1: '时间段', B1: '订单数', C1: '销售额', D1: '扣卡金额', E1: '日期'};
      function generateExportData(row) {
        var result = [];
        result.push(row.time_tag);
        result.push(row.order_count);
        result.push(row.order_total_price);
        result.push(row.order_actual_amount);
        result.push(row.date);
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
          saveAs(new Blob([s2ab(wbout)], {type: 'application/octet-stream'}), '订单统计报表.xls');
          $scope.$emit(GlobalEvent.onShowLoading, false);
        }
      };
      //</editor-fold>

    }]);