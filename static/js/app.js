//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


(function () {
  'use strict';

  /**
   * App module; bootstraps the application.
   */
  angular.module('iml', window.dependencies)
    .config(['$interpolateProvider', function ($interpolateProvider) {
      $interpolateProvider.startSymbol('((');
      $interpolateProvider.endSymbol('))');
    }])
    .config(['$httpProvider', function ($httpProvider) {
      $httpProvider.defaults.xsrfCookieName = 'csrftoken';
      $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    }])
    .config(['$dialogProvider', function ($dialogProvider) {
      $dialogProvider.options({
        backdropFade: true,
        dialogFade: true
      });
    }])
    .run(['$rootScope', 'STATIC_URL', 'safeApply', function ($rootScope, STATIC_URL, safeApply) {
      safeApply.addToRootScope();

      $rootScope.config = {
        asStatic: function (url) {
          return STATIC_URL + url;
        }
      };

      $rootScope.isCollapsed = true;
    }]);
}());
