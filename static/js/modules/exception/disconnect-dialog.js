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


(function () {
  'use strict';

  // This is gross but we can't depend on $http to be working when we are getting 0 status codes.
  // We also may not auto cache templates at dev time.
  var template = '<div> \
    <div class="modal-body"> \
      <h3>Disconnected From Server, Retrying. <i class="icon-spinner icon-spin icon-large"></i></h3>\
    </div> \
  </div>';

  angular.module('exception').factory('disconnectDialog', ['$dialog', '$window', function ($dialog, $window) {
    var unloading = false;

    $window.addEventListener('beforeunload', function beforeUnload() {
      unloading = true;
    });

    var dialog = $dialog.dialog({
      dialogFade: false,
      backdropFade: false,
      backdropClick: false,
      dialogClass: 'modal disconnect-modal',
      keyboard: false,
      template: template
    });

    var oldOpen = dialog.open;

    dialog.open = function() {
      if (unloading)
        return null;

      return oldOpen.apply(dialog, arguments);
    };

    return dialog;
  }]);
}());
