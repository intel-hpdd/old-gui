//
// INTEL CONFIDENTIAL
//
// Copyright 2013-2014 Intel Corporation All Rights Reserved.
//
// The source code contained or described herein and all documents related
// to the source code ("Material") are owned by Intel Corporation or its
// suppliers or licensors. Title to the Material remains with Intel Corporation
// or its suppliers and licensors. The Material contains trade secrets and
// proprietary and confidential information of Intel or its suppliers and
// licensors. The Material is protected by worldwide copyright and trade secret
// laws and treaty provisions. No part of the Material may be used, copied,
// reproduced, modified, published, uploaded, posted, transmitted, distributed,
// or disclosed in any way without Intel's prior express written permission.
//
// No license under any patent, copyright, trade secret or other intellectual
// property right is granted to or conferred upon you by disclosure or delivery
// of the Materials, either expressly, by implication, inducement, estoppel or
// otherwise. Any license under such intellectual property rights must be
// express and approved by Intel in writing.


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
