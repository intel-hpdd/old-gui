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


(function (_) {
  'use strict';

  var factoryName = 'exceptionInterceptor';

  /**
   * Intercepts requests and responses from the $http service and calls the $exceptionHandler if necessary.
   * @param {function} $exceptionHandler
   * @param {object} $q
   * @param {object} $injector
   * @returns {{requestError: function, responseError: function}}
   */
  function exceptionInterceptor($exceptionHandler, $q, $injector) {
    var cached = {};

    return {
      requestError: function requestError(rejection) {
        var args = [];

        if (rejection instanceof Error) {
          args.unshift(rejection);
        } else if (_.isString(rejection)) {
          args.unshift(null, rejection);
        } else {
          var error = new Error('Request Error');

          error.rejection = rejection;

          args.unshift(error);
        }

        $exceptionHandler.apply($exceptionHandler, args);
      },
      responseError: function responseError(response) {
        var rejected = $q.reject(response);

        //400s and 403s do not trigger the dialog. It is the responsibility of the base model to handle them.
        //Pass through replays if they failed for the same reason.
        if (response.status === 400 || response.status === 403 || (response.status === 0 && response.config.UI_REPLAY))
          return rejected;

        //Currently Angular does not have a nice way to determine whether a request was aborted on purpose.
        //@Fixme: Look at this again when https://github.com/angular/angular.js/issues/4491 is resolved.
        if (response.status === 0 && get('replay').isIdempotent(response.config))
          return get('disconnectHandler').add(response.config);

        var error = new Error('Response Error!');

        // Add the response to the error instance.
        error.response = {
          data: response.data,
          status: response.status,
          headers: response.headers(),
          config: response.config
        };

        $exceptionHandler(error);

        return rejected;
      }
    };

    function get(serviceName) {
      return cached[serviceName] || (cached[serviceName] = $injector.get(serviceName));
    }
  }

  angular.module('exception')
    .factory(factoryName, ['$exceptionHandler', '$q', '$injector', exceptionInterceptor])
    .config(['$httpProvider', function ($httpProvider) {
      $httpProvider.interceptors.push(factoryName);
    }]);
}(window.lodash));
