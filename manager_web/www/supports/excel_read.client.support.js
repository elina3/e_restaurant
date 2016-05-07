/**
 * Created by louisha on 15/11/30.
 */

'use strict';

angular.module('EWeb').factory('ExcelReadSupport',
    [function () {

        function to_json(workbook) {
            var result = {};
            workbook.SheetNames.forEach(function (sheetName) {
                var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                if (roa.length > 0) {
                    result[sheetName] = roa;
                }
            });
            return result;
        }

        function checkIsOurTemplate(sheet, sheetColumn, callback) {
            if (!sheet) {
                return callback(false);
            }
            for (var index = 0; index < sheetColumn.length; index++) {
                var column = sheetColumn[index].key;

                if (column) {
                    var columnName = sheet[column].v;
                    if (columnName !== sheetColumn[index].value) {
                        return callback(false);
                    }
                }
                else {
                    return callback(false);
                }
            }

            return callback(true);
        }

        function generaData(workbook, callback) {
            var jsonResult = to_json(workbook);
            var xlsSheetArray = jsonResult[workbook.SheetNames[0]];
            //var jsonResultString = JSON.stringify(xlsSheetArray);
            if (xlsSheetArray) {
                return callback(null, xlsSheetArray);
            }
            else {
                return callback('表格数据解析错误', null);
            }
        }

        return {
            generalDataByExcelFile: function (file, sheetOrder, callback) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var data = e.target.result;

                    var workbook = XLSX.read(data, {type: 'binary'});
                    if (workbook.SheetNames.length <= 0) {
                        return callback('表格中没有数据');
                    }
                    if (sheetOrder) {
                        checkIsOurTemplate(workbook.Sheets.Sheet1, sheetOrder, function (isTrue) {
                            if (!isTrue) {
                                return callback('表格模板不正确，请选择正确的表格模板');
                            }
                            else {
                                generaData(workbook, function (err, data) {
                                    return callback(err, data);
                                });
                            }

                        });
                    }
                    else {
                        generaData(workbook, function (err, data) {
                            return callback(err, data);
                        });
                    }
                };

                reader.readAsBinaryString(file);
            }
        };

    }]);
