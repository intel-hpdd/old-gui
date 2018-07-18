//
// Copyright (c) 2018 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


(function () {
  'use strict';

  angular.module('exception').config(['$provide', function ($provide) {
    $provide.decorator('$exceptionHandler', ['$injector', '$delegate', function ($injector, $delegate) {
      var triggered,
        cache = {};

      return function(exception, cause) {
        //Always hit the delegate.
        $delegate(exception, cause);

        if (triggered) return;

        triggered = true;

        // Lazy Load to avoid a $rootScope circular dependency.
        var exceptionDialog = get('exceptionDialog'),
          ClientErrorModel = get('ClientErrorModel'),
          $document = get('$document');

        exceptionDialog.options.resolve = {
          exception: function () { return exception; },
          cause: function () { return cause; }
        };

        exceptionDialog.open();

        //We are not interested in saving server generated errors.
        if (exceptionOrEmptyObj().response) return;

        var err = new ClientErrorModel();

        err.stack = exceptionOrEmptyObj().stack;
        err.message = exceptionOrEmptyObj().message;
        err.url = $document[0].URL;
        err.cause = cause;

        err.$save();

        function exceptionOrEmptyObj () { return exception || {}; }
      };

      function get(serviceName) {
        return cache[serviceName] || (cache[serviceName] = $injector.get(serviceName));
      }
    }]);
  }]);
}());
