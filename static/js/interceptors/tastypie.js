//
// Copyright (c) 2018 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


(function (_) {
  'use strict';

  angular.module('interceptors')
    .factory('tastypieInterceptor', [function tastypieInterceptor() {
      return {
        /**
         * A Factory function that intercepts successful http responses
         * and puts the meta property at a higher level if it is a tastypie generated response.
         * @returns {object} The transformed response.
         */
        response: function (resp) {
          var fromTastyPie = _.isObject(resp.data) && _.isObject(resp.data.meta) && Array.isArray(resp.data.objects);

          // If we got data, and it looks like a tastypie meta/objects body
          // then pull off the meta.
          if (fromTastyPie) {
            var temp = resp.data.objects;

            resp.props = resp.data;
            delete resp.data.objects;

            resp.data = temp;
          }

          // Return the response for further processing.
          return resp;
        }
      };
    }])
    .config(function ($httpProvider) {
      // register the interceptor.
      $httpProvider.interceptors.push('tastypieInterceptor');
    });
}(window.lodash));
