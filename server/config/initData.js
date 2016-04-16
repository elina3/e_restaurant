/**
 * Created by elinaguo on 16/2/29.
 */
'use strict';

var userLogic = require('../logics/user');
exports.createDefaultGroup = function(){
  userLogic.createHospital({name: '瑞金医院古北分院', address: '上海市长宁区红宝石路398号'}, function(err, hospital){
    if(err){
      console.log('create default hospital failed');
      return;
    }


    userLogic.createGroup({
      name: '餐厅',
      address: '1号楼',
      hospital_id: hospital._id.toString(),
      wechat_app_info: {
        app_id: '',
        secret: ''
      }
    }, function(err, restaurantGroup){
      if(err){
        console.log('create restaurant group:', err);
        return;
      }

      console.log('create restaurant group success!!!!');
      console.log(JSON.stringify(restaurantGroup));

      userLogic.createGroup({
        name: '超市',
        address: '2号楼',
        hospital_id: hospital._id.toString(),
        wechat_app_info: {
          app_id: '',
          secret: ''
        }
      }, function(err, superMarketGroup){
        if(err){
          console.log('create superMarket group:', err);
          return;
        }

        console.log('create superMarket group success!!!!');
        console.log(JSON.stringify(restaurantGroup));

        var userInfo = {
          username : 'mh-rjgb@rjhgb.com',
          password : '123456',
          nickname : '管理员',
          role : 'admin',
          hospital_id: hospital._id.toString(),
          group_id: restaurantGroup._id.toString(),//默认餐厅管理员
          sex : 'female',
          mobile_phone : '18321740710',
          head_photo : '',
          description : ''
        };
        userLogic.signUpAdmin(userInfo, function(err, admin){
          if(err){
            console.log('create admin failed');
            console.log(err);
            return;
          }


          console.log('create default admin success!!!!');
          console.log(JSON.stringify(admin));

          userLogic.createHospital({name: '瑞金医院古北分院', address: '上海市长宁区红宝石路398号', groups: [restaurantGroup._id.toString(), superMarketGroup._id.toString()], hospital: hospital._id.toString()}, function(err, hospital) {
            if (err) {
              console.log('create default hospital failed');
              return;
            }

          });
        });
      });
    });
  });
};
