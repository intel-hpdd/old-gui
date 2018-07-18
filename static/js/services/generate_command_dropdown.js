//
// Copyright (c) 2017 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


(function () {
  'use strict';

  //@TODO: This module is a stopgap. Remove when directives can be natively interpreted.

  function factory($rootScope, $compile) {
    return {
      /**
       * @description Abstraction to integrate the command-dropdown with datatables.
       * @param {number} index
       * @param {function} [transformFunc]
       * @param {function} [abortFunc]
       * @param {function} [commandClick]
       * @returns {function}
       */
      dataTableCallback: function (index, transformFunc, abortFunc, commandClick) {
        transformFunc = transformFunc || angular.identity;
        abortFunc = abortFunc || function () { return false; };

        /**
         * @description Called after a row draw. A good place to hook in.
         * @param {Object} row
         * @param {Object} data
         * @returns {[]}
         */
        return function fnRowCallback(row, data) {
          data = transformFunc(data);

          if (abortFunc(data)) {
            return row;
          }

          // NOTE: This is only being done because of the Angular in Backbone paradigm.
          var $actionCell = angular.element(row).find('td:nth-child(%d)'.sprintf(index));

          this.generateDropdown($actionCell, data, null, commandClick);

          return row;
        }.bind(this);
      },
      /**
       * @description The main core of this module. Takes an element and generates a command-dropdown directive
       * @param {object} parentOrElement The parent to insert into or the element itself
       * @param {object} data The data to attach to scope.
       * @param {string} [placement] What direction? 'top'|'bottom'|'left'|'right'
       * @param {Function} [commandClick] Passes the commandClick to the directive.
       * @returns {object} The command-dropdown element
       */
      generateDropdown: function (parentOrElement, data, placement, commandClick) {
        placement = placement || 'left';

        var isElement = (parentOrElement.attr('command-dropdown') !== undefined &&
          parentOrElement.attr('command-dropdown') !== false);

        var hasCommandClick =  (typeof commandClick === 'function');

        var template = (isElement ?
          parentOrElement:
          '<div command-dropdown command-placement="%s" command-data="data"%s></div>'.sprintf(
            placement,
            hasCommandClick ? ' command-click="commandClick($event, data, done)"': ''
          ));

        var insertfunc = (isElement ? angular.noop: function (fragment) { parentOrElement.html(fragment); });

        // NOTE: This is only being done because of the Angular in Backbone paradigm.
        var $scope = $rootScope.$new();

        $scope.data = data;

        if (hasCommandClick)
          $scope.commandClick = commandClick;

        return $scope.safeApply(function () {
          var link = $compile(template);
          var fragment = link($scope);
          insertfunc(fragment);

          return fragment.bind('$destroy', function () {
            $scope.safeApply(function () { $scope.$destroy(); }, $scope);

            fragment.unbind('$destroy');
          });
        }, $scope);
      }
    };
  }

  angular.module('services').factory('generateCommandDropdown', ['$rootScope', '$compile', factory]);
}());
