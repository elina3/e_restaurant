/**
 * Created by elinaguo on 16/7/10.
 */
'use strict';

angular.module('EWeb').controller('MealTypeController',
  ['$scope', '$window', '$stateParams', '$rootScope', 'GlobalEvent', '$state', 'Auth', 'MealTypeService', 'Config', 'QiNiuService',
    function ($scope, $window, $stateParams, $rootScope, GlobalEvent, $state, Auth, MealTypeService, Config, QiNiuService) {

      $scope.mealTypes = [];
      $scope.goBack = function () {
        $state.go('meal_setting');
      };


      var defaultChoosePackageMealObj = {id: false, text: '基础设置'};
      $scope.editPanel = {
        types: [{id: false, text: '基础设置'}, {id: true, text: '选餐'}],
        isShow: false,
        errorMessage: '',
        isModify: false,
        currentMealType: {
          name: '',
          breakfast_price: '',
          lunch_price: '',
          dinner_price: '',
          need_choose_package_meal: defaultChoosePackageMealObj,
          package_meals: [{name: '', price: ''}],
          deletePackage: function (index) {
            this.package_meals.splice(index, 1);
          },
          addPackage: function () {
            this.package_meals.push({name: '', price: ''});
          }
        },
        disabledName: false,
        getNeedChoosePackageMeal: function (mealType) {
          var types = $scope.editPanel.types.filter(function (item) {
            return mealType.need_choose_package_meal === item.id;
          });

          return types[0];
        },
        show: function (mealType) {
          this.isShow = true;

          if (mealType) {
            this.isModify = true;
            this.currentMealType._id = mealType._id;
            this.currentMealType.name = mealType.name;
            this.currentMealType.breakfast_price = mealType.breakfast_price / 100;
            this.currentMealType.lunch_price = mealType.lunch_price / 100;
            this.currentMealType.dinner_price = mealType.dinner_price / 100;
            this.currentMealType.need_choose_package_meal = this.getNeedChoosePackageMeal(mealType);
            if(!mealType.need_choose_package_meal){
              this.currentMealType.package_meals = [{name: '', price: '', display_photo: ''}];
            }else{
              this.currentMealType.package_meals = mealType.package_meals.map(function (item) {
                return {
                  name: item.name,
                  price: item.price / 100,
                  display_photo: item.display_photo
                };
              });
            }
          }
        },
        hide: function () {
          this.isShow = false;
          this.reset();
        },
        reset: function () {
          this.currentMealType._id = '';
          this.currentMealType.name = '';
          this.currentMealType.breakfast_price = '';
          this.currentMealType.lunch_price = '';
          this.currentMealType.dinner_price = '';
          this.currentMealType.need_choose_package_meal = defaultChoosePackageMealObj;
          this.currentMealType.name = '';
          this.package_meals = [{name: '', price: ''}];
          this.errorMessage = '';
          this.isModify = false;
        },
        valid: function () {
          this.errorMessage = '';

          if (!this.currentMealType.need_choose_package_meal.id) {

            if (amountParse(this.currentMealType.dinner_price) < 0) {
              this.errorMessage = '请输入正确的晚餐价格.';
            }

            if (amountParse(this.currentMealType.lunch_price) < 0) {
              this.errorMessage = '请输入正确的午餐价格.';
            }

            if (amountParse(this.currentMealType.breakfast_price) < 0) {
              this.errorMessage = '请输入正确的早餐价格.';
            }
          }
          else {
            var message = '';
            var names = [];
            this.currentMealType.package_meals.forEach(function (item, i) {
              if (!message) {
                if (amountParse(item.price) < 0) {
                  message = '请检查第' + (i + 1) + '个套餐的价格。';
                }

                if (!item.name) {
                  message = '请输入第' + (i + 1) + '个套餐名称。';
                }

                if(!item.display_photo){
                  message = '请选择第' + (i+1)+'个套餐的图片';
                }
              }
              if (names.indexOf(item.name) === -1) {
                names.push(item.name);
              }
            });
            this.errorMessage = message;

            if (names.length !== this.currentMealType.package_meals.length) {
              this.errorMessage = '套餐名称重复';
            }

            if (this.currentMealType.package_meals.length === 0) {
              this.errorMessage = '请至少设置一个套餐.';
            }
          }

          if (!this.currentMealType.name) {
            this.errorMessage = '请输入餐种名称.';
          }

          return this.errorMessage === '' ? true : false;
        },
        prepareCreateParam: function () {
          var isPackageMeals = this.currentMealType.need_choose_package_meal.id;
          this.currentMealType.package_meals.forEach(function (item) {
            if (isPackageMeals) {
              item.price = amountParse(item.price) * 100;
            } else {
              item.price = 0;
            }
          });

          return {
            need_choose_package_meal: this.currentMealType.need_choose_package_meal.id,
            name: this.currentMealType.name,
            breakfast_price: !isPackageMeals ? amountParse(this.currentMealType.breakfast_price) * 100 : 0,
            lunch_price: !isPackageMeals ? amountParse(this.currentMealType.lunch_price) * 100 : 0,
            dinner_price: !isPackageMeals ? amountParse(this.currentMealType.dinner_price) * 100 : 0,
            package_meals: this.currentMealType.package_meals
          };
        },
        sure: function () {
          if (!this.valid()) {
            return;
          }

          var that = this;
          var mealTypeInfo = this.prepareCreateParam();

          if(!that.isModify){
            MealTypeService.addNewMealType(mealTypeInfo, function (err, data) {
              if (err || !data || !data.meal_type) {
                return $scope.$emit(GlobalEvent.onShowAlert, err || '保存失败');
              }

              that.hide();
              that.reset();
              loadMealTypes();
              $scope.$emit(GlobalEvent.onShowAlert, '保存成功');
            });
          }else{
            MealTypeService.modifyMealType(this.currentMealType._id, mealTypeInfo, function(err, data){
              if (err || !data || !data.meal_type) {
                return $scope.$emit(GlobalEvent.onShowAlert, err || '修改失败');
              }
              that.hide();
              that.reset();
              loadMealTypes();
              $scope.$emit(GlobalEvent.onShowAlert, '修改成功');
            });
          }
        }
      };

      $scope.create = function () {
        $scope.editPanel.show();
      };

      $scope.delete = function (mealType) {
        $scope.$emit(GlobalEvent.onShowAlertConfirm,
          {
            title: '确认操作', content: '您确定要删除该餐种吗', callback: function () {
            $scope.$emit(GlobalEvent.onShowLoading, true);
            MealTypeService.deleteMealType(mealType._id, function (err, data) {
              $scope.$emit(GlobalEvent.onShowLoading, false);
              if (err || !data || !data.success) {
                return $scope.$emit(GlobalEvent.onShowAlert, err || '操作失败');
              }

              if (data.success) {
                loadMealTypes();
                $scope.$emit(GlobalEvent.onShowAlert, '删除成功');
              }
            });
          }
          });
      };

      function loadMealTypes() {
        $scope.$emit(GlobalEvent.onShowLoading, true);
        MealTypeService.getMealTypes(function (err, data) {
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err || !data || !data.meal_types) {
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          if (data.meal_types) {
            $scope.mealTypes = data.meal_types;
          }
        });
      }

      function init() {
        loadMealTypes();
      }

      init();




      //<editor-fold desc="图片上传相关">

      var qiniuToken = '';
      function getQiniuToken(callback){
       if(qiniuToken){
         return callback(null, qiniuToken);
       }

        QiNiuService.qiNiuKey(function(err, data){
          if(err){
            console.log(err);
            return callback('无法获取图片上传凭证');
          }

          qiniuToken = data.token;
          return callback(null, qiniuToken);
        });

      }

      $scope.deleteDisplayPhoto = function(packageMeal){
        packageMeal.display_photo = '';
      };

      $scope.onFileSelect = function (files, packageMeal) {
        files = files || [];
        if(files.length === 0){
          return $scope.$emit(GlobalEvent.onShowAlert, '请选择图片');
        }

        getQiniuToken(function(err, token){
          if(err){
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          QiNiuService.upload({
            file: files[0],
            token: token
          }).then(function(response){
            packageMeal.display_photo = response.key;
          });
        });
      };

      $scope.generateStyle = function (key) {
        return {
          'background': 'url(' + Config.qiniuServerAddress + key + ') no-repeat center top',
          'background-size': 'cover'
        };
      };

      //</editor-fold>

    }]);
