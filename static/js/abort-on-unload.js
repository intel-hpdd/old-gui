//
// Copyright (c) 2017 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


(function () {
  'use strict';

  var pageIsUnloading = false;
  var xhrs = [];

  $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
    if (pageIsUnloading) {
      jqXHR.abort();
    }
  });

  $(document).ajaxSend(function (e, jqXHR) {
    xhrs.push(jqXHR);
  })
  .ajaxComplete(function (e, jqXHR) {
    var xhrIndex = xhrs.indexOf(jqXHR);

    if (xhrIndex > -1) {
      xhrs.splice(xhrIndex, 1);
    }
  });

  window.onbeforeunload = function () {
    pageIsUnloading = true;

    xhrs.forEach(function (xhr) {
      xhr.abort();
    });
  };
}());
