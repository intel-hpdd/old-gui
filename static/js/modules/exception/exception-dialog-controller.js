//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


(function (_) {
  'use strict';

  function ExceptionDialogCtrl($scope, $document, $parse, exception, cause) {
    $scope.exceptionDialog = {
      messages: [],
      reload: function () {
        $document[0].location.reload(true);
      }
    };

    if(cause) exception.cause = cause;

    $scope.exceptionDialog.messages = new PropLookup($parse, exception)
      .add('cause')
      .path('response')
      .add({name: 'status', alias: 'Response Status'})
      .path('response.data')
      .add({name: 'error_message', alias: 'Error Message'})
      .add({name: 'traceback', alias: 'Server Stack Trace', transform: lookupAnd(multiLineTrim)})
      .path('response')
      .add({name: 'headers', alias: 'Response Headers', transform: lookupAnd(stringify)})
      .path('response.config')
      .add('method')
      .add('url')
      .add({name: 'headers', alias: 'Request Headers', transform: lookupAnd(stringify)})
      .add({name: 'data', transform: lookupAnd(stringify)})
      .reset()
      .add('name')
      .add('message')
      .add({name: 'stack', alias: 'Client Stack Trace', transform: lookupAnd(multiLineTrim)})
      .get();


    function lookupAnd(func) {
      return function (name, spot) {
        var value = spot[name];

        if (!value) return false;

        try {
          return func(value);
        } catch (e) {
          return String(value).valueOf();
        }
      };
    }

    function stringify(value) {
      return JSON.stringify(value, null, 2);
    }

    function multiLineTrim(value) {
      return value.split('\n').map(function (line) {
        return line.trim();
      }).join('\n');
    }
  }

  angular.module('exception')
    .controller('ExceptionDialogCtrl', ['$scope', '$document', '$parse', 'exception', 'cause', ExceptionDialogCtrl]);


  /**
   * Helper class that builds a message list from a given object
   * @param {function} $parse
   * @param {object} obj
   * @constructor
   */
  function PropLookup($parse, obj) {
    this._$parse = $parse;
    this._obj = obj;
    this.messages = [];

    this.reset();
  }

  /**
   * Moves the spot to the parsed expression on the object.
   * @param {string} expression
   * @returns {PropLookup} This instance for chaining.
   */
  PropLookup.prototype.path = function path(expression) {
    this.spot = this._$parse(expression)(this._obj);

    return this;
  };

  /**
   * Resets the spot to the top of the object.
   * @returns {PropLookup} This instance for chaining.
   */
  PropLookup.prototype.reset = function path() {
    this.spot = this._obj;

    return this;
  };

  /**
   * Adds the item to the messages if it is found.
   * @param {string|object} item
   * @returns {PropLookup} This instance for chaining
   */
  PropLookup.prototype.add = function add(item) {
    if (!this.spot) return this;

    if (_.isString(item)) item = {name: item};

    if (!_.isPlainObject(item)) return this;

    _.defaults(item, {
      transform: function (name, spot) {
        return spot[name];
      },
      alias: item.name
    });

    var value = item.transform(item.name, this.spot);

    if (value)
      this.messages.push({name: item.alias, value: value});

    return this;
  };

  /**
   * Returns the list of messages.
   * @returns {Array} The messages.
   */
  PropLookup.prototype.get = function get() {
    return this.messages;
  };

}(window.lodash));
