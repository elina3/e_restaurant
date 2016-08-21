/**
 * Created by elinaguo on 15/10/19.
 */
'use strict';
var self = exports;

String.prototype.Trim = function ()
{
  /// <summary>
  /// 字符串去除前后空格
  /// </summary>
  /// <returns type=""></returns>
  return this.replace(/(^\s*)|(\s*$)/g, "");
};

Array.prototype.objectIndexOf = function (objectKey, value) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] && this[i][objectKey] && value && this[i][objectKey].toString() === value.toString()) {
      return i;
    }
  }
  return -1;
};

Date.prototype.Format = function (fmt) {
  /// <summary>
  /// 对Date的扩展，将 Date 转化为指定格式的String
  /// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
  /// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
  /// 例子：
  /// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
  /// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
  /// </summary>
  /// <param name="fmt"></param>
  /// <returns type=""></returns>
  var o = {
    'M+': this.getMonth() + 1,                 //月份
    'd+': this.getDate(),                    //日
    'h+': this.getHours(),                   //小时
    'm+': this.getMinutes(),                 //分
    's+': this.getSeconds(),                 //秒
    'q+': Math.floor((this.getMonth() + 3) / 3), //季度
    'S': this.getMilliseconds()             //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp('(' + k + ')').test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
  return fmt;
};

exports.isNullOrEmpty = function (value) {
  return (value === undefined || value === null || value === '');
};
exports.isTrue = function (value) {
  if (self.isNullOrEmpty(value))
    return false;

  return (value.toString().toLowerCase() === 'true');
};

exports.isString = function (value) {
  return Object.prototype.toString.call(value) === "[object String]";
};

//数字解析，解析不出来返回null
exports.parseIntNumber = function (numberString) {
  var number;
  try {
    number = parseInt(numberString);
    //isFinite() 用于检查其参数值是否是有限.  true表示有限，false表示无限大
    number = !isNaN(number) && isFinite(number) ? number : null;
  } catch (e) {
    number = null;
  }
  return number;
};

//正整数解析
exports.parsePositiveIntNumber = function (numberString) {
  var number = self.parseIntNumber(numberString);
  if (number === null) {
    return null;
  }

  if (number <= 0) {
    return null;
  }

  return number;
};

//非负整数解析（正整数和0）
exports.parseNonNegativeIntNumber = function (numberString) {
  var number = self.parseIntNumber(numberString);
  if (number === null) {
    return null;
  }

  if (number < 0) {
    return null;
  }

  return number;
};

function parseFloatNumber(numberText) {
  var number;
  try {
    number = parseFloat(numberText);
    //isFinite() 用于检查其参数值是否是有限.  true表示有限，false表示无限大
    number = !isNaN(number) && isFinite(number) ? number : null;
  } catch (e) {
    number = null;
  }
  return number;
}

exports.amountParse = function (numberString) {
  var amount = -1;
  try {
    amount = parseFloat(numberString);
    amount = isNaN(amount) ? -1 : amount;
    if (amount < 0) {
      amount = -1;
    }
  } catch (e) {
    amount = -1;
  }
  return amount;
};

exports.parseFloatNumber = function(amount){
  return parseFloatNumber(amount);
};

exports.parseLocation = function (centerLocationParams) {
  if (!Array.isArray(centerLocationParams) || centerLocationParams.length !== 2) {
    return [];
  }

  var longitude = parseFloatNumber(centerLocationParams[0]);
  var latitude = parseFloatNumber(centerLocationParams[1]);

  if (longitude < 0 && latitude < 0) {
    return [];
  }

  return [longitude, latitude];
};

//是否为布尔值
exports.isBoolean = function (value) {
  if (self.isNullOrEmpty(value))
    return false;

  var valueString = value.toString().toLowerCase();
  return (valueString === 'true' || valueString === 'false');
};
//布尔值解析
exports.booleanParse = function (value) {
  if (self.isNullOrEmpty(value))
    return null;

  var valueString = value.toString().toLowerCase();
  return valueString === 'true' ? true : (valueString === 'false' ? false : null);
};

exports.parseToDate = function(time) {
  if (!time) {
    time = new Date();
  }
  return new Date(time.toDateString());
};

exports.validPhone = function (phone) {
  var phoneReg = /\d{11}/;
  if (!phoneReg.test(phone) || phone.length != 11) {
    return false;
  }

  return true;
};