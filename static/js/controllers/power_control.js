//
// Copyright (c) 2017 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


(function () {
  'use strict';

  function PowerCtrl($scope, $dialog, $q, hostModel, PowerControlDeviceModel, pageTitle) {

    pageTitle.set('Configuration - Power Control');

    $scope.powerCtrl = {
      hosts: hostModel.query({ limit: 0 }),
      powerControlDevices: PowerControlDeviceModel.query({order_by: 'name'}),
      /**
       * Indicates whether or not any of the instantiated devices are IPMI.
       * @returns {Boolean}
       */
      hasIpmi: function (powerControlDevices) {
        return powerControlDevices.some(function (device) {
          return device.isIpmi();
        });
      },
      /**
       * @description Instantiates the and opens add BMC dialog.
       * @param {PowerControlDeviceModel} device
       * @param {hostModel} host
       */
      createBmc: function createBmc(device, host) {
        var dialog = $dialog.dialog({
          resolve: {
            device: function () { return device; },
            host: function () { return host; }
          }
        });

        dialog.open($scope.config.asStatic('partials/dialogs/create_bmc.html'), 'CreateBmcCtrl');
      },
      /**
       * @description Instantiates the and opens create pdu dialog.
       * @param {[PowerControlDeviceModel]} devices
       * @param {PowerControlDeviceModel} [device]
       * @param {boolean} [ipmi]
       */
      createPdu: function createPdu(devices, device, ipmi) {
        var dialog = $dialog.dialog({
          resolve: {
            devices: function () { return devices; },
            device: function () { return device; },
            ipmi: function () { return ipmi; }
          }
        });

        dialog.open($scope.config.asStatic('partials/dialogs/create_pdu.html'), 'CreatePduCtrl');
      },
      /**
       * @description Deletes the given device. Then removes it from the powerControlDevices list.
       * @param {PowerControlDeviceModel} device
       */
      deletePdu: function (device) {
        device.$delete().then(function success() {
          var deviceIndex = this.powerControlDevices.indexOf(device);
          this.powerControlDevices.splice(deviceIndex, 1);
        }.bind(this));
      }
    };
  }

  angular.module('controllers').controller('PowerCtrl',
    ['$scope', '$dialog', '$q', 'hostModel', 'PowerControlDeviceModel', 'pageTitle', PowerCtrl]
  );
}());
