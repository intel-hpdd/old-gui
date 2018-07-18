//
// Copyright (c) 2017 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


(function () {
  'use strict';

  angular.module('iml')
    // Since we are not using the router, we need an explicit import of location to trigger it's location change
    // events at the right time.
    .run(['$location', angular.noop]);
}());
