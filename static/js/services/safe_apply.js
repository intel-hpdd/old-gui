//
// Copyright (c) 2018 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


angular.module('services').factory('safeApply', ['$rootScope', function ($rootScope) {
  'use strict';

  return {
    addToRootScope: function () {
      $rootScope.safeApply = function (func, $scope) {
        $scope = $scope || $rootScope;
        func = func || angular.noop;

        if ($scope.$root.$$phase) {
          return func();
        } else {
          return $scope.$apply(func);
        }
      };
    }
  };
}]);
