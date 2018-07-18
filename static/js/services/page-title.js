//
// Copyright (c) 2018 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


(function () {
  'use strict';

  function PageTitle($window) {
    this.set = function(title) {
      $window.document.title = title;
    };
    this.get = function() {
      return $window.document.title;
    };
  }

  angular.module('services').service('pageTitle',['$window', PageTitle]);

})();
