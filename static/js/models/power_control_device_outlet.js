//
// Copyright (c) 2018 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


(function (_) {
  'use strict';

  angular.module('models').factory('PowerControlDeviceOutlet', ['baseModel', function (baseModel) {
    /**
     * @description Represents a power control device outlet
     * @class PowerControlDeviceOutlet
     * @returns {PowerControlDeviceOutlet}
     * @constructor
     */
    return baseModel({
      url: '/api/power_control_device_outlet/:powerControlDeviceOutletId',
      params: {powerControlDeviceOutletId: '@id'},
      methods: {
        /**
         * Does this outlet have a host?
         * @returns {boolean}
         */
        isAvailable: function () {
          return this.host === null;
        },
        /**
         * A more friendly string based version of has_power.
         * @returns {string}
         */
        hasPower: function () {
          var states = {
            on: true,
            off: false,
            unknown: null
          };

          return _.findKey(states, function (val) {
            return val === this.has_power;
          }.bind(this));
        }
      }
    });
  }]);

}(window.lodash));
