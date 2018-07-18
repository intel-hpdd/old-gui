//
// Copyright (c) 2017 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


(function () {
  'use strict';

  angular.module('constants', [])
    .constant('STATIC_URL', window.STATIC_URL)
    .constant('UI_ROOT', '/ui/')
    .constant('HELP_TEXT', window.HELP_TEXT);
}());
