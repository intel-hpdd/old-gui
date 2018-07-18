//
// Copyright (c) 2017 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


angular.module('help', ['constants']).factory('help', ['$sce', 'HELP_TEXT', function ($sce, HELP_TEXT) {
  'use strict';

  var trusted = {};

  function addToTrusted (key) {
    trusted[key] = $sce.trustAsHtml(HELP_TEXT[key]);

    return trusted[key];
  }

  return {
    get: function (key) {
      if (!HELP_TEXT[key]) throw new Error('Key %s is not in help text!'.sprintf(key));

      return trusted[key] || addToTrusted(key);
    }
  };
}]);

