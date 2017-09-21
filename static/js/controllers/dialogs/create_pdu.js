//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


(function (_) {
  'use strict';

  function CreatePduCtrl($window, $scope, dialog, PowerControlTypeModel, PowerControlDeviceModel, devices, device, ipmi) {
    /**
     * @description A generic error callback that can be called for an update or a save.
     * @param {object} resp the error response.
     */
    function errback(resp) {
      if (resp.status === 400)
        $scope.createPduCtrl.err = angular.isString(resp.data) ? {__all__: [resp.data]} : resp.data;

    }

    $scope.createPduCtrl = {
      close: dialog.close.bind(dialog),
      closeAlert: function (index) {
        this.err.__all__.splice(index, 1);
      }
    };

    var extension;
    var getDeviceType;

    if (device != null) {
      extension = {
        form: angular.copy(device),
        submit: function (data) {
          data.$update().then(function success(resp) {
            angular.copy(resp, device);
            dialog.close();
          }, errback);
        },
        type: 'edit',
        ipmi: ipmi,
        title: 'Edit Pdu: %s'.sprintf(device.name)
      };

      getDeviceType = function (resp) {
        return _.where(resp, {id: device.device_type.id})[0];
      };
    } else {
      extension = {
        form: {},
        submit: function (data) {
          PowerControlDeviceModel.save(data).$promise.then(function success() {
            PowerControlDeviceModel.query().$promise.then(function success(resp) {
              angular.copy(resp, devices);
              dialog.close();
            });
          }, errback);
        },
        type: 'add',
        ipmi: ipmi,
        title: ipmi ? 'Configure IPMI' : 'New PDU'
      };

      if (ipmi != null) {
        // Special case for IPMI support -- force-select the IPMI type.
        getDeviceType = function (resp) {
          return _.find(resp, function (type) {
            return type.max_outlets === 0;
          });
        };
      } else {
        getDeviceType = _.first;
      }
    }

    _.extend($scope.createPduCtrl, extension);

    if (ipmi != null) {
      // Fetch the possible IPMI power controller types from page cache
      $scope.createPduCtrl.powerControlTypes = $window.CACHE_INITIAL_DATA.power_control_type
        .filter(function filterIPMI(item) { return item.make === 'IPMI'; });
      extension.form.name = 'IPMI';
      extension.form.address = '0.0.0.0';
      extension.form.device_type = $scope.createPduCtrl.powerControlTypes[0];
    } else {
      // TODO:  Use CACHE_INITIAL_DATA like above.
      PowerControlTypeModel.query().$promise.then(function (resp) {
        // Filter out IPMI types for non-IPMI PDU creation
        $scope.createPduCtrl.powerControlTypes = resp.filter(function (type) {
          return type.max_outlets > 0;
        });
      extension.form.device_type = getDeviceType(resp);
      });
    }
  }

  angular.module('controllers').controller('CreatePduCtrl',
    ['$window', '$scope', 'dialog', 'PowerControlTypeModel', 'PowerControlDeviceModel', 'devices', 'device', 'ipmi', CreatePduCtrl]
  );
}(window.lodash));
