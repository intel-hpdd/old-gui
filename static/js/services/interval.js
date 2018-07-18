//
// Copyright (c) 2018 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


(function () {
  'use strict';

  angular.module('timing', []).factory('interval', ['$window', '$rootScope', function ($window, $rootScope) {
    /**
     * This function is a simple wrapper around set interval, mostly to aid testing.
     * @param {function} func The function to call.
     * @param {number} delay The number of milliseconds to delay the interval call.
     * @param {Boolean} [callBeforeDelay] Should func be called before the delay? Defaults to false.
     * @returns {function} A function that can be called to clear this interval.
     */
    return function run(func, delay, callBeforeDelay) {
      function runFunc() {
        $rootScope.safeApply(func);
      }

      if (callBeforeDelay) {
        runFunc();
      }

      var intervalId = $window.setInterval(runFunc, delay);

      return function clear() {
        $window.clearInterval(intervalId);
      };
    };
  }]);
}());
