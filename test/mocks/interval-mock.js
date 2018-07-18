//
// Copyright (c) 2018 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


(function () {
  'use strict';

  angular.module('imlMocks', ['ng']).factory('interval', function () {
    var queue = [];

    function run(func, delay, callBeforeDelay) {
      //Push function into the queue
      queue.push(func);

      if (callBeforeDelay) {
        func();
      }

      return function clear() {
        queue.splice(queue.indexOf(func), 1);
      };
    }

    //@TODO: Take parameter to advance interval timer.
    run.flush = function flush() {
      queue.forEach(function (func) {
        func();
      });
    };

    return run;
  });

}());
