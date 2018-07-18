//
// Copyright (c) 2017 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


(function () {
  'use strict';

  var html = /\.html$/;
  var slash = /\/$/;

  angular.module('interceptors').factory('cleanRequestUrlInterceptor', [function () {
    return {
      request: function (config) {
        if (html.test(config.url)) return config;

        if (!slash.test(config.url)) config.url += '/';

        return config;
      }
    };
  }])
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push('cleanRequestUrlInterceptor');
  });
}());
