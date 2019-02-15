//
// Copyright (c) 2018 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


(function () {
  'use strict';

  function factory(STATIC_URL, $window) {
    return {
      restrict: 'A',
      scope: {
        placement: '@commandPlacement',
        data: '=commandData',
        commandClick: '&'
      },
      templateUrl: '%spartials/directives/command_dropdown.html'.sprintf(STATIC_URL),
      link: function postLink(scope, el, attrs) {
        var hasCommandClicked = 'commandClick' in attrs;

        /**
         * @description builds the list of actions that can be performed.
         */
        function buildList() {
          var availableActions = angular.copy(scope.data['available_actions']);
          scope.list = Array.isArray(availableActions) ? 
            availableActions.filter(item => item.verb !== null) : [];
        }

        /**
         * @description creates event handlers. Proxies the call to LiveObject.
         * @param {string} type
         */
        function generateHandler(type) {
          var handlerName = '%sClicked'.sprintf(type);

          scope[handlerName] = (hasCommandClicked ? commandClickedHandler : originalHandler);

          /**
           * Invokes the corresponding LiveObject
           * handler call.
           * @param {Object} $event
           */
          function originalHandler ($event) {
            $window.LiveObject[handlerName].apply($event.target);
          }

          /**
           * Invokes the command clicked handler.
           * @param {Object} $event
           */
          function commandClickedHandler ($event) {
            scope.commandClick({
              $event: $event,
              data: scope.data,
              done: originalHandler.bind(null, $event)
            });
          }
        }

        scope.toJson = angular.toJson;

        var deregistrationFunctions = [];

        deregistrationFunctions[0] = scope.$on('disableCommandDropdown', function (ev, uri) {
          if (scope.data.resource_uri === uri) {
            el.addClass('hide');
          }
        });

        deregistrationFunctions[1] = scope.$on('updateCommandDropdown', function (ev, uri, obj) {
          function runUpdate() {
            scope.data = obj;
            buildList();
          }

          if (scope.data.resource_uri === uri) {
            el.removeClass('hide');

            scope.$root.safeApply(runUpdate, scope);
          }
        });

        // Setup handlers.
        generateHandler('action');

        // Build the list the first time.
        buildList();

        // Blank out the button if a job is in progress
        if ($window.CommandNotification.uriIsWriteLocked(scope.data.resource_uri)) {
          scope.$broadcast('disableCommandDropdown', scope.data.resource_uri);
        }

        scope.$on('$destroy', function () {
          deregistrationFunctions.forEach(function (func) { func(); });
        });
      }
    };
  }

  /**
   * @description Service wrapper for the command dropdown. Useful for testing.
   * @name commandDropdownService
   */
  angular.module('services').factory('commandDropdownService', ['STATIC_URL', '$window', factory]);

  /**
   * @description Generates a dropdown based on a given resource.
   * @name commandDropdown
   * @example
   * <div command-dropdown command-placement="right" command-data="((data))"></div>
   */
  angular.module('directives').directive('commandDropdown', ['commandDropdownService', angular.identity]);
}());
