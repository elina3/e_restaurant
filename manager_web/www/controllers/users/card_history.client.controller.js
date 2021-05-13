/**
 * Created by elinaguo on 16/4/24.
 */

'use strict';
angular.module('EWeb').controller('CardHistoryController',
  ['$rootScope', '$scope', 'GlobalEvent', '$state', 'CardHistoryService', 'Config', '$window', 'CardService', 'Auth', 'ExcelReadSupport',
    function ($rootScope, $scope, GlobalEvent, $state, CardHistoryService, Config, $window, CardService, Auth, ExcelReadSupport) {
      if (!Auth.getUser()) {
        $state.go('user_sign_in');
        return;
      }
      $scope.pageData = {
        keyword: '',
        action: {id: '', text: '不限'},
        actions: [{id: '', text: '不限'},
          {id: 'create', text: '注册新卡'},
          {id: 'recharge', text: '现金充值'},
          {id: 'recharge_virtual', text: '虚拟充值'},
          {id: 'delete', text: '删除卡'},
          {id: 'change_status', text: '卡变更'},
          {id: 'close', text: '退卡'},
          {id: 'pay', text: '消费'},
          {id: 'recreate', text: '补卡新卡'},
          {id: 'replace', text: '补卡'}],
        statistics: {},
        pagination: {
          currentPage: 1,
          limit: 10,
          totalCount: 0,
          isShowTotalInfo: true,
          onCurrentPageChanged: function (callback) {
            loadCardHistories();
          }
        },
        cardHistories: []
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
          timePicker: true,
          timePicker12Hour: false,
          timePickerIncrement: 1,
          separator: ' ~ ',
          format: 'YY/MM/DD HH:mm'
        }
      };

      $scope.searchKey = function () {
        loadCardHistories();
      };
      $scope.goBack = function () {
        $window.history.back();
      };
      $scope.goToStatistic = function () {
        $state.go('card_statistic');
      };

      $scope.deleteCardPay = function (cardHistory) {

        $scope.$emit(GlobalEvent.onShowAlertConfirm,
          {
            title: '确认操作', content: '您确定要删除该消费记录吗？', callback: function () {
            $scope.$emit(GlobalEvent.onShowLoading, true);
            CardHistoryService.deleteCardPay(cardHistory._id, function (err, result) {
              $scope.$emit(GlobalEvent.onShowLoading, false);
              loadCardHistories();
              if (err || !result) {
                return $scope.$emit(GlobalEvent.onShowAlert, err || '删除出错');
              }

              $scope.$emit(GlobalEvent.onShowAlert, '删除成功！');
            });
          }
          });
      };

      function loadCardHistories() {
        $scope.$emit(GlobalEvent.onShowLoading, true);

        var filter = {
          keyword: $scope.pageData.keyword,
          action: $scope.pageData.action.id
        };


        var timeRange = {};
        if ($scope.pageShow.createTimeRange) {
          if ($scope.pageShow.createTimeRange.startDate && $scope.pageShow.createTimeRange.startDate._d) {
            timeRange.startTime = moment($scope.pageShow.createTimeRange.startDate).toISOString();
          }
          if ($scope.pageShow.createTimeRange.endDate && $scope.pageShow.createTimeRange.endDate._d) {
            timeRange.endTime = moment($scope.pageShow.createTimeRange.endDate).toISOString();
          }
        }
        var timeRangeString = JSON.stringify(timeRange);

        CardHistoryService.getCardHistories($scope.pageData.pagination,
          filter, timeRangeString, function (err, data) {
            if (err || !data) {
              $scope.$emit(GlobalEvent.onShowLoading, false);
              return $scope.$emit(GlobalEvent.onShowAlert, err);
            }
            $scope.pageData.cardHistories = data.card_history_list;
            $scope.pageData.pagination.totalCount = data.total_count;
            $scope.pageData.pagination.limit = data.limit;
            $scope.pageData.pagination.pageCount = Math.ceil($scope.pageData.pagination.totalCount / $scope.pageData.pagination.limit);


            if (timeRange.startTime) {
              filter.startTimeStamp = new Date(timeRange.startTime).getTime();
            }
            if (timeRange.endTime) {
              filter.endTimeStamp = new Date(timeRange.endTime).getTime();
            }
            CardService.getStatistics(filter, function (err, data) {
              $scope.$emit(GlobalEvent.onShowLoading, false);
              if (err || !data) {
                return $scope.$emit(GlobalEvent.onShowAlert, err);
              }

              $scope.pageData.statistics.total_recharge_amount = data.total_recharge_amount;
              $scope.pageData.statistics.total_close_amount = data.total_close_amount;
              $scope.pageData.statistics.total_delete_amount = data.total_delete_amount;
            });
          });
      }

      function init() {
        loadCardHistories();
      }

      init();

      //<editor-fold desc="导入相关">

      var importSheet = {A1: '姓名', B1: '身份证号码', C1: '科室', D1: '卡号'};

      function generateImportCardList(data, extDatas) {
        var addressList = [];
        for (var i = 0; i < data.length; i++) {
          var obj = {
            nickname: data[i][importSheet.A1],
            id_number: data[i][importSheet.B1],
            department: data[i][importSheet.C1],
            card_number: data[i][importSheet.D1]
          };
          addressList.push(obj);
        }
        return addressList;
      }

      function formatUnitExcel(dataObj) {
        for (var prop in importSheet) {
          if (!dataObj[importSheet[prop]]) {
            dataObj[importSheet[prop]] = '';
          }
        }
      }

      function validExcelData(data) {
        var errors = [];
        for (var i = 0; i < data.length; i++) {
          formatUnitExcel(data[i]);
          for (var key in data[i]) {
            switch (key) {
              case importSheet.A1:
                if (!data[i][key]) {
                  data[i].index = i + 1;
                  data[i].error = {
                    index: i,
                    message: importSheet.A1 + '未填'
                  };
                  errors.push(data[i]);
                }
                break;
              case importSheet.B1:
                if (!data[i][key]) {
                  data[i].error = {
                    index: i,
                    message: importSheet.B1 + '未填'
                  };
                  errors.push(data[i]);
                }
                break;
              default :
                break;
            }
          }
        }

        return {errors: errors};
      }

      function transferExcelData(data) {
        var result = validExcelData(data);
        return {
          success: result.errors.length === 0,
          errors: result.errors,
          cardList: result.errors.length === 0 ? generateImportCardList(data, result.extDatas) : []
        };
      }

      $scope.importCards = [];

      $scope.onFileSelect = function (element) {
        var file = element.files[0];
        var suffix_file = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
        document.getElementById('card-filename').outerHTML = document.getElementById('card-filename').outerHTML;
        document.getElementById('card-filename').value = '';
        if (suffix_file !== 'xls' && suffix_file !== 'xlsx') {
          return $scope.$emit(GlobalEvent.onShowAlert, {content: '选择的文件不是Excel文件'});
        }

        $scope.$apply(function () {
          var sheetColumn = [];//{key: 'A1', value: '姓名'},
          for (var prop in importSheet) {
            sheetColumn.push({
              key: prop,
              value: importSheet[prop]
            });
          }
          ExcelReadSupport.generalDataByExcelFile(file, sheetColumn, function (err, data) {
            if (err) {
              $scope.$emit(GlobalEvent.onShowAlert, {content: err});
              $scope.$apply();
              return;
            }
            var result = transferExcelData(data);
            if (!result.success) {
              $scope.$emit(GlobalEvent.onShowAlert, {content: '数据格式有误，第' + (result.errors[0].error.index + 1) + '条' + result.errors[0].error.message});
              $scope.$apply();
              return;
            }
            $scope.importCards = result.cardList;
          });
        });
      };


      var importCards = [];
      var existCards = [];

      function uploadCardInfos(cardInfos, param, i, callback) {
        CardService.batchImportCards(param, function (err, data) {

          if (err) {
            return callback(err);
          }

          importCards = importCards.concat(data.cards);
          existCards = existCards.concat(data.existCards);
          console.log(data);
          if (cardInfos[i]) {
            var newParam = {
              card_list: cardInfos[i++],
              append_method: 'append'
            };
            uploadCardInfos(cardInfos, newParam, i, callback);
          }
          else {
            return callback();
          }
        }, function (data) {
          console.log(data);
          return callback(data);
        });
      }

      function batchUploadPOI(callback) {
        var cardInfos = $scope.importCards;
        var queue = [];

        var blockSize = 4;

        var queueSize = Math.ceil(cardInfos.length / blockSize);
        for (var i = 1; i <= queueSize; i++) {
          var cardInfoBlock = cardInfos.slice((i - 1) * blockSize, i * blockSize);
          var subQueue = [];
          cardInfoBlock.forEach(function (cardInfo) {
            subQueue.push(cardInfo);
          });
          queue.push(subQueue);
        }

        var param = {
          card_list: queue[0],
          append_method: 'replace'
        };
        uploadCardInfos(queue, param, 1, callback);
      }


      $scope.batchImportCards = function () {
        if ($scope.importCards.length === 0)
          return;
        $scope.$emit(GlobalEvent.onShowLoading, true);
        importCards = [];
        existCards = [];

        $scope.$emit(GlobalEvent.onShowLoading, true);
        batchUploadPOI(function (err) {

          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err) {
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          return $scope.$emit(GlobalEvent.onShowAlert, '成功导入' + importCards.length + '个饭卡!已存在' + existCards.length + '个');
        });
      };
      //</editor-fold>

      //<editor-fold desc="导出相关">

      var exportSheet = {A1: '证件号', B1: '旧卡', C1: '描述', D1: '金额更换', E1: '变更金额', F1: '新卡', G1: '经办人／消费者', H1: '时间', I1: '卡类型'};

      function getBalanceString(newAmount, oldAmount){
        var str = '--';
        if((newAmount || newAmount === 0) && (oldAmount || oldAmount === 0)){
          str = newAmount - oldAmount;
        }
        return str;
      }
      function getAmountChangeString(oldAmount, newAmount){
        var str = '--';
        if(oldAmount || oldAmount === 0){
          str = oldAmount + '-';
        }
        if(newAmount || newAmount === 0){
          str += newAmount;
        }
        return str;
      }
      function generateExportData(row) {
        var result = [];
        result.push(row.id_number );
        result.push(row.card_number);
        result.push(row.description);
        result.push(getAmountChangeString(row.amount, row.new_amount));
        result.push(getBalanceString(row.new_amount, row.amount));
        result.push(row.new_card_number || '--');
        result.push((row.create_user && row.create_user.nickname) || (row.create_client && row.create_client.nickname) || '--');
        result.push(row.create_time && new Date(row.create_time).Format('yyyy/MM/dd hh:mm:ss') || '--');
        result.push(CardService.translateCardType(row.card_type));
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

      function exportCardHistoriesByFilter() {
        $scope.$emit(GlobalEvent.onShowLoading, true);

        var filter = {
          keyword: $scope.pageData.keyword,
          action: $scope.pageData.action.id
        };

        //解析时间段
        var start, end;
        if ($scope.pageShow.createTimeRange) {
          if ($scope.pageShow.createTimeRange.startDate && $scope.pageShow.createTimeRange.startDate._d) {
            start = moment($scope.pageShow.createTimeRange.startDate);
          }
          if ($scope.pageShow.createTimeRange.endDate && $scope.pageShow.createTimeRange.endDate._d) {
            end = moment($scope.pageShow.createTimeRange.endDate);
          }
        }

        //检查是否选择开始时间和结束时间
        var limitDays = 90;//90天
        if (!start || !end) {
          $scope.$emit(GlobalEvent.onShowAlert, '请先筛选时间段，不能超过' + limitDays + '天！！');
          $scope.$emit(GlobalEvent.onShowLoading, false);
          return;
        }

        //时间段不等超过90天
        var seconds = end.diff(start, 'seconds');
        if (seconds > limitDays * 24 * 60 * 60) {
          $scope.$emit(GlobalEvent.onShowAlert, '时间筛选不能超过' + limitDays + '天！！');
          $scope.$emit(GlobalEvent.onShowLoading, false);
          return;
        }

        var timeRange = {startTime: start.toISOString(), endTime: end.toISOString()};
        var timeRangeString = JSON.stringify(timeRange);
        CardHistoryService.exportCardHistoriesByFilter(filter, timeRangeString, function (err, result) {
          if (err || !result) {
            $scope.$emit(GlobalEvent.onShowLoading, false);
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          var data = generateExcelDataArray(result.card_history_list);
          var filename = result.file_name || '饭卡历史记录.xls';
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
            saveAs(new Blob([s2ab(wbout)], {type: 'application/octet-stream'}), filename);
            $scope.$emit(GlobalEvent.onShowLoading, false);
          }


        });
      }

      $scope.exportCardHistoriesToExcel = exportCardHistoriesByFilter;
      //</editor-fold>


    }]);
