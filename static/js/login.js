//
// INTEL CONFIDENTIAL
//
// Copyright 2013-2016 Intel Corporation All Rights Reserved.
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


var Login = (function () {
  var user = null;

  function userHasGroup(required_group) {
    if (!user) {
      return false;
    } else {
      var match = false;
      for(var i = 0; i < user.groups.length; i++) {
        group = user.groups[i];
        if ((group.name == required_group) || (group.name == "superusers")) {
          return true;
        }
      }
      return false;
    }
  }

  function init() {
    /* Discover information about the currently logged in user (if any)
     * so that we can put the user interface in the right state and
     * enable API calls */
    Api.get("/api/session/", {}, success_callback = function (session) {
      user = session.user;

      Api.enable();
    }, undefined, false, true);
  }

  function getUser() {
    return user;
  }

  return {
    init: init,
    getUser: getUser,
    userHasGroup: userHasGroup
  };
}());

var ValidatedForm = function() {
  function add_error(input, message) {
    if(input) {
        input.before("<span class='error'>" + message + "</span>").addClass('error');
    }
  }

  function save(element, api_fn, url, obj, success, error, form_params) {

    if (_.isObject(form_params)) {
      $.extend(obj, form_params);
    } else {
      element.find('input').each(function() {
        obj[$(this).attr('name')] = $(this).val();
      });
    }

    return api_fn(url, obj,
      success_callback = function(data) {
        clear_errors(element);
        if (success) {
          success(data);
        }
      },
      {
        400: function(jqXHR) {
          if (error) {
            error();
          }
          var errors = JSON.parse(jqXHR.responseText);
          element.find('span.error').remove();
          element.find('input, textarea').removeClass('error');
          $.each(errors, function(attr_name, error_list) {
            $.each(error_list, function(i, error) {
              var sel = 'input[name="%1$s"], textarea[name="%1$s"], select[name="%1$s"]'.sprintf(attr_name);
              add_error(element.find(sel), error);
            });
          });
        }
      }
    );
  }

  function clear_errors(element) {
    element.find('span.error').remove();
    element.find('input, textarea').removeClass('error');
  }

  function clear(element) {
    element.find('input, textarea').val("");
    clear_errors(element);
  }

  function reset(element, obj) {
    element.find('input, textarea').each(function() {
      $(this).val(obj.get($(this).attr('name')));
    });
  }

  return {
    add_error: add_error,
    save: save,
    clear: clear,
    reset: reset,
    clear_errors: clear_errors
  }
}();
