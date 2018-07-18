//
// Copyright (c) 2017 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


(function () {
  'use strict';


  // This is gross but we can't depend on $http to be working when there is an exception.
  // We also may not auto cache templates at dev time.
  var template = '<div> \
    <div class="modal-header"> \
        <h3>An Error Has Occurred!</h3> \
    </div> \
    <div class="modal-body"> \
      <ul> \
        <li ng-repeat="item in exceptionDialog.messages"> \
          <h5>((item.name | capitalize:true)):</h5> \
          <pre>((item.value))</pre> \
        </li> \
      </ul> \
    </div> \
    <div class="modal-footer"> \
      <button ng-click="exceptionDialog.reload()" class="btn btn-large btn-block" type="button"> \
        <i class="icon-rotate-right"></i> Reload\
      </button> \
    </div> \
  </div>';


  angular.module('exception').factory('exceptionDialog', ['$dialog', function ($dialog) {
    return $dialog.dialog({
      dialogFade: true,
      backdropClick: false,
      dialogClass: 'modal exception-dialog',
      keyboard: false,
      controller: 'ExceptionDialogCtrl',
      template: template
    });
  }]);
}());
