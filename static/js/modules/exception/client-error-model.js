//
// Copyright (c) 2018 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


angular.module('exception').factory('ClientErrorModel', ['baseModel', function ClientErrorModel(baseModel) {
  'use strict';

  return baseModel({
    url: '/api/client_error/'
  });
}]);
