/**
 * Created by elinaguo on 16/2/29.
 */
'use strict';

var userLogic = require('../logics/user');
exports.createDefaultGroup = function(){
  var defaultUserGroup = {
    name: '民航上海医院餐厅',
    hospital: '民航上海医院',
    address: '',
    wechat_app_info: {
      app_id: '',
      secret: ''
    }
  };
  userLogic.createGroup(defaultUserGroup, function(err, newGroup){
    if(err){

      console.log('create default group:', err);
      return;
    }

    console.log('create default group success!!!!');
    console.log(JSON.stringify(newGroup));
    return ;
  });
};
