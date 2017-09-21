//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


(function () {
  'use strict';

  function disconnectHandlerFactory(disconnectDialog, interval, replay) {
    var clearIntervalFunc, goPromise;

    return {
      add: function add(config) {
        var promise = replay.add(config);

        // We are already processing.
        if (clearIntervalFunc) return promise;

        clearIntervalFunc = interval(checkAndClear, 5000, false);

        if (!disconnectDialog.isOpen()) disconnectDialog.open();

        return promise;
      }
    };

    function checkAndClear() {
      // We are already processing.
      if (goPromise) return;

      goPromise = replay.go();

      goPromise.finally(function cleanup() {
        //Flag we are not processing the queue anymore.
        goPromise = null;

        if (!replay.hasPending) {
          clearIntervalFunc();
          clearIntervalFunc = null;

          disconnectDialog.close();
        }
      });
    }
  }

  angular.module('exception').factory('disconnectHandler',
    ['disconnectDialog', 'interval', 'replay', disconnectHandlerFactory]);
}());
