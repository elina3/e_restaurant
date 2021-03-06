/**
 * Created by louisha on 15/7/3.
 */
'use strict';

angular.module('EClientWeb').constant('EventError',
    {
        invalid_account: '无效的账户',
        invalid_password: '密码错误',
        account_not_match: '账户不匹配',
        internal_system_error: '系统错误，请联系管理员',
        undefined_access_token: '账户access_token不存在',
        invalid_access_token: '账户信息丢失，请重新登录',
        account_existed: '账号已存在',
        account_deleted: '账号已删除',
        user_not_exist: '用户不存在',
        not_admin:'不是管理员',
        null_error: '字段值错误',
        params_error: '参数错误',
        id_param_null: '_id参数为空',
        account_not_exist: '该账号不存在',
        name_null: '名称不存在',
        category_not_exist: '产品品类不存在',
        username_param_error: '手机输入不正确',
        password_param_error: '密码输入不正确',
        invalid_mobile_phone: '电话号码输入不正确',
        contact_name_null: '联系人信息还没有',
        district_null: '区域信息还没有',
        distributor_not_exist: '经销商不存在',
        distributor_deleted: '经销商已被删除',
        no_grocery_address:'地址还没有',
        no_grocery_location:'地理位置还没有',
        no_grocery_photos:'店铺照片还没有',
        no_grocery_area:'店铺区域还没有',
        no_annual_sales:'年营业额还没有',
        grocer_deleted:'小店已删除',
        cart_null:'购物车不存在',
        category_null:'商品品类不存在',
        goods_id_null:'商品ID为空',
        brand_null:'商品标签为空',
        goods_not_exist:'商品不存在',
        goods_deleted:'商品已下架',
        price_param_error:'价格输入错误',
        market_price_param_error:'价格输入错误',
        name_param_error:'名称输入错误',
        grocer_not_exist:'小店不存在',
        grocer_id_null:'小店ID不存在',
        distributor_null:'合作商还没有',
        wrong_price:'错误的价格',
        distributor_goods_source_not_match:'经销商商品不匹配',
        sku_null:'SKU不存在',
        no_grocery_name:'小店名称还没有',
        goods_source_not_match:'商品来源不匹配',
        grocer_order_not_exist:'订单不存在',
        grocer_order_deleted:'订单已被删除',
        grocer_order_id_null:'订单ID',
        no_nickname:'请输入姓名'
    }
);
