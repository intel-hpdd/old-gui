//
// Copyright (c) 2017 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


(function () {
  'use strict';

  var contextTooltipName = 'contextTT';
  function nameSuffix(suffix) { return contextTooltipName + suffix; }

  function factory($tooltip, HELP_TEXT) {
    return {
      restrict: 'A',
      scope: true,
      link: function postLink(scope, el, attrs) {
        attrs.$observe('contextTooltip', function (value) {
          attrs.$set(contextTooltipName, HELP_TEXT[value]);
        });

        $tooltip(contextTooltipName, 'tooltip', 'mouseenter').link(scope, el, attrs);
      }
    };
  }

  /**
   * @description Service wrapper for Context Tooltips. Useful for testing.
   * @name contextTooltipService
   */
  angular.module('services').factory('contextTooltipService', ['$tooltip', 'HELP_TEXT', factory]);

  /**
   * Adds a tooltip
   * @name contextTooltip
   * @example
   * <a context-tooltip="tooltip_name" tooltip-placement="right"></a>
   * @see {@link http://angular-ui.github.io/bootstrap/#/tooltip|Tooltip Options}
   */
  angular.module('directives').directive('contextTooltip', ['contextTooltipService', angular.identity]);

  /**
   * @description Interfaces with the tooltip directive to render the correct tooltip.
   */
  angular.module('directives').directive(nameSuffix('Popup'), function () {
    return {
      restrict: 'E',
      replace: true,
      scope: { content: '@', placement: '@', animation: '&', isOpen: '&' },
      templateUrl: 'template/tooltip/tooltip-html-unsafe-popup.html'
    };
  });
}());
