//
// Copyright (c) 2018 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


(function (_) {
  'use strict';

  angular.module('models').factory('baseModel', ['$resource', 'paging', function ($resource, paging) {
    /**
     * @description Represents the base model.
     * @class baseModel
     * @returns {baseModel}
     * @constructor
     */
    return function getModel(config) {
      var defaults = {
        params: {},
        actions: {
          get: {method: 'GET'},
          save: {method: 'POST'},
          update: {method: 'PUT'},
          remove: {method: 'DELETE'},
          delete: {method: 'DELETE'},
          patch: {method: 'PATCH'},
          query: {
            method: 'GET',
            isArray: true,
            interceptor: {
              response: function (resp) {
                resp.resource.paging = paging(resp.props.meta);

                return resp.resource;
              }
            }
          }
        },
        methods: {}
      };

      _.merge(defaults, config);

      if (defaults.url === undefined) {
        throw new Error('A url property must be provided to baseModel');
      }

      return $resource(defaults.url, defaults.params, defaults.actions, defaults.methods);
    };
  }]);
}(window.lodash));
