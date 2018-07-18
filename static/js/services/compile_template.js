//
// Copyright (c) 2017 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


(function () {
  'use strict';

  //@TODO: This module is a stopgap. Remove when directives can be natively interpreted.

  function factory($rootScope, $compile) {

    /**
     * Helper function to compile a template.
     * @param {object|string} template DOM partial or string
     * @returns {object} compiled template
    */
    return function compileTemplate(template) {
      // NOTE: This is only being done because of the Angular in Backbone paradigm.
      var $scope = $rootScope.$new();

      return $scope.safeApply(function () {
        var link = $compile(template);
        var fragment = link($scope);

        return fragment.bind('$destroy', function () {
          $scope.safeApply(function () { $scope.$destroy(); });

          fragment.unbind('$destroy');
        });
      });
    };

  }

  angular.module('services').factory('compileTemplate', ['$rootScope', '$compile', factory]);
}());
