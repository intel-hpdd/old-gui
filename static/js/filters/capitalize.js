//
// Copyright (c) 2018 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


(function (_) {
  'use strict';

  /**
   * Upper case the first character of the passed in string.
   */
  angular.module('filters').filter('capitalize', [function () {
    return function (words, all) {
      if (!_.isString(words)) return words;

      if (all)
        words = words.trim().split(/\s+/).map(capitalize).join(' ');
      else
        words = capitalize(words);

      return words;
    };

    function capitalize(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
  }]);
}(window.lodash));
