//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


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
