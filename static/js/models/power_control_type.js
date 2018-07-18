//
// Copyright (c) 2018 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


(function () {
  'use strict';

  /**
   * @description Represents a power control device item
   * @class PowerControlTypeModel
   * @param {object} baseModel
   * @returns {PowerControlTypeModel}
   * @constructor
   */
  function PowerControlTypeModel(baseModel) {
    return baseModel({
      url: '/api/power_control_type'
    });
  }

  angular.module('models').factory('PowerControlTypeModel', ['baseModel', PowerControlTypeModel]);
}());
