//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


(function () {
  'use strict';

  angular.module('iml')
    // TODO: ngInclude -> $anchorScroll -> $location. We do not use $anchorScroll and we do not want to import
    // location as it conflicts with Backbone's router. Remove this when routing goes through Angular.
    .value('$anchorScroll', null)
    // TODO: patching $location with a noop as it conflicts with Backbone's router.
    // Remove this when routing goes through Angular.
    .value('$location', {
      path: angular.noop
    });
}());
