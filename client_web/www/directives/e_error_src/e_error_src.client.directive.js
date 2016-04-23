/**
 * Created by elinaguo on 16/4/23.
 */

'use strict';
angular.module('EClientWeb').directive('errSrc',
  function () {
    return {
      link: function(scope, element, attrs) {
        element.bind('error', function() {
          if (attrs.src !== attrs.errSrc) {
            attrs.$set('src', attrs.errSrc);
          }
        });
      }
    };
  });



