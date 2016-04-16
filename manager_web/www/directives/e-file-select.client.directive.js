'use strict';
/**
 * Created by elina on 15/6/24.
 */
angular.module('EWeb').directive('eFileSelect', ['$parse', '$timeout',
    function ($parse, $timeout) {
        return function (scope, elem, attr) {
            var fn = $parse(attr.eFileSelect);
            if (elem[0].tagName.toLowerCase() !== 'input' || (elem.attr('type') && elem.attr('type').toLowerCase()) !== 'file') {
                var fileElem = angular.element('<input type="file">');
                for (var i = 0; i < elem[0].attributes.length; i++) {
                    fileElem.attr(elem[0].attributes[i].name, elem[0].attributes[i].value);
                }
                if (elem.attr('data-multiple')) fileElem.attr('multiple', 'true');
                //fileElem.css('top', 0).css('bottom', 0).css('left', 0).css('right', 0).css('width', '100%').
                //    css('opacity', 0).css('position', 'absolute').css('filter', 'alpha(opacity=0)');
                elem.append(fileElem);
                //if (elem.css('position') === '' || elem.css('position') === 'static') {
                //    elem.css('position', 'relative');
                //}
                elem = fileElem;
            }
            elem.bind('change', function (evt) {
                var files = [],
                    fileList, i;
                fileList = evt.__files_ || evt.target.files;
                if (fileList !== null) {
                    for (i = 0; i < fileList.length; i++) {
                        files.push(fileList.item(i));
                    }
                }
                $timeout(function () {
                    fn(scope, {
                        $files: files,
                        $event: evt
                    });
                });
            });
        };
    }
]);
