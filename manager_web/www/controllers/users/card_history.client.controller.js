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
          timePicker: false,
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
      $scope.goToStatistic = function(){
        $state.go('card_statistic');
      };

      function loadCardHistories() {
        $scope.$emit(GlobalEvent.onShowLoading, true);

        var filter = {
          keyword: $scope.pageData.keyword,
          startTimeStamp: -1,
          endTimeStamp: -1,
          action: $scope.pageData.action.id
        };

        if ($scope.pageShow.createTimeRange) {
          if ($scope.pageShow.createTimeRange.startDate && $scope.pageShow.createTimeRange.startDate._d) {
            filter.startTimeStamp = $scope.pageShow.createTimeRange.startDate._d.getTime();
          }
          if ($scope.pageShow.createTimeRange.endDate && $scope.pageShow.createTimeRange.endDate._d) {
            filter.endTimeStamp = $scope.pageShow.createTimeRange.endDate._d.getTime();
          }
        }

        CardHistoryService.getCardHistories($scope.pageData.pagination,
          filter, function (err, data) {
            if (err || !data) {
              $scope.$emit(GlobalEvent.onShowLoading, false);
              return $scope.$emit(GlobalEvent.onShowAlert, err);
            }
            $scope.pageData.cardHistories = data.card_history_list;
            $scope.pageData.pagination.totalCount = data.total_count;
            $scope.pageData.pagination.limit = data.limit;
            $scope.pageData.pagination.pageCount = Math.ceil($scope.pageData.pagination.totalCount / $scope.pageData.pagination.limit);
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
        batchUploadPOI(function(err){

          $scope.$emit(GlobalEvent.onShowLoading, false);
          if(err){
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          return $scope.$emit(GlobalEvent.onShowAlert, '成功导入'+importCards.length+'个饭卡!已存在'+ existCards.length+'个');
        });
      };
      //</editor-fold>


    }]);
