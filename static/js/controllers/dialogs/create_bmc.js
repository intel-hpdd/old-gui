//
// Copyright (c) 2018 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


(function () {
  'use strict';

  function CreateBmcCtrl($scope, dialog, PowerControlDeviceOutlet, device, host) {
    /**
     * @description A generic error callback that can be called for an update or a save.
     * @param {object} resp the error response.
     */
    function errback(resp) {
      if (resp.status === 400)
        $scope.createBmcCtrl.err = angular.isString(resp.data) ? {__all__: [resp.data]} : resp.data;

    }

    $scope.createBmcCtrl = {
      form: {device: device.resource_uri, host: host.resource_uri},
      submit: function (data) {
        PowerControlDeviceOutlet.save(data).$promise.then(function success(resp) {
          device.outlets.push(resp);
          dialog.close();
        }, errback);
      },
      title: 'New BMC',
      close: dialog.close.bind(dialog),
      closeAlert: function (index) {
        this.err.__all__.splice(index, 1);
      }
    };
  }

  angular.module('controllers').controller('CreateBmcCtrl',
    ['$scope', 'dialog', 'PowerControlDeviceOutlet', 'device', 'host', CreateBmcCtrl]
  );
}());
