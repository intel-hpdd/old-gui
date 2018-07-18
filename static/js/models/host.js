//
// Copyright (c) 2018 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


angular.module('models').factory('hostModel', ['baseModel', function (baseModel) {
  'use strict';

  /**
   * @description Represents a host
   * @class hostModel
   * @returns {hostModel}
   * @constructor
   */
  return baseModel({
    url: '/api/host/:hostId',
    params: {hostId: '@id'},
    methods: {
      hasIpmi: function (devices) {
        var ipmi = _.filter(devices, function (device) {
          return device.isIpmi();
        });

        if (ipmi.length === 0) {
          return false;
        }

        var host = this;
        return _.filter(ipmi, function (device) {
          return device.outlets.some(function (outlet) {
            return outlet.host === host.resource_uri;
          });
        }).length > 0;
      },
      hasOutlets: function (devices) {
        var non_ipmi = _.filter(devices, function (device) {
          return !device.isIpmi();
        });

        if (non_ipmi.length === 0) {
          return false;
        }

        var host = this;
        return _.filter(non_ipmi, function (device) {
          return device.outlets.some(function (outlet) {
            return outlet.host === host.resource_uri;
          });
        }).length > 0;
      }
    }
  });

}]);
