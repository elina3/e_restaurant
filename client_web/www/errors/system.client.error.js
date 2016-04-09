/**
 * Created by louisha on 15/9/24.
 */
'use strict';

angular.module('EClientWeb').constant('SystemError',
    {
        internal_system_error: '系统错误，请联系管理员',
        undefined_access_token: '账户access_token不存在',
        invalid_access_token: '账户信息丢失，请重新登录',
        null_error: '字段值错误',
        params_error: '参数错误',
        network_error: '网络错误',
        database_save_error: '数据库保存异常',
        data_is_null: '服务器返回数据为空',
        'entity.too.large': '请求传递的数据已超过最大限制，请考虑分批传递'
    }
);
