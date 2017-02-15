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


/* So that Backbone.sync will pass GET list parameters
 * in the way that tastypie requires them */
jQuery.ajaxSetup({traditional: true});

/* Override backbone.sync to deal with {meta:, objects:}
 * output from API calls */
Backbone.base_sync = Backbone.sync
Backbone.sync = function(method, model, options) {
  var outer_success = options.success;
  var outer_this = this;
  options.success = function(data) {
    // If we got data, and it looks like a tastypie meta/objects body
    // then just extract the .objects to give Backbone the list it
    // expects
    if (data && data.meta != undefined && data.objects != undefined) {
      arguments[0] = data.objects;
    }
    outer_success.apply(outer_this, arguments);
  };

  var outer_error = options.error;
  options.error = function(jqXHR) {
    outer_error.apply(outer_this, [jqXHR]);
  };

  var getValue = function(object, prop) {
    if (!(object && object[prop])) return null;
    return _.isFunction(object[prop]) ? object[prop]() : object[prop];
  };
  var url = options.url || getValue(model, 'url') || urlError();
  var data = options.data || model.toJSON();
  var type = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read':   'GET'
  }[method];

  // Backbone composes urls without a trailing slash
  if (url.substr(url.length - 1) !== '/') {
    url = url + "/";
  }

  Api.call(type, url, data, options.success, options.error, false);
};

/* The Api module wraps the global state used for
 * accessing the /api/ URL space */
var Api = function() {
  var errored = false;
  var outstanding_requests = 0;
  var api_available = false;
  var API_PREFIX = "/api/";
  var UI_ROOT = "/ui/";
  var lost_contact = false;
  var lost_contact_at;
  var CONTACT_RETRY_INTERVAL = 5000;
  var calls_waiting = 0;
  var enable_overlay = true;

  function testMode(enable)
  {
    if (enable == undefined) {
      return !enable_overlay
    }
    if (enable) {
      enable_overlay = false;
      jQuery.fx.off = true;
    } else {
      enable_overlay = true;
    }

    return "rhubarb"
  }

  function enable()
  {
    api_available = true;
    $('body').trigger('api_available');
    $('body').unbind('api_available');
  }

  function unexpectedError (jqXHR)
  {
      // On 'unauthorized' bounce them to the root to
      // give them a chance to login
      if (jqXHR.status == 401) {
        window.location.href = UI_ROOT;
        return
      }

      /* Caller has provided no error handlers, this is a bug
         or unhandled error */
      try {
        var response_content = JSON.parse(jqXHR.responseText)
      } catch(e) {
        blockingError({
          Status: jqXHR.status + "(" + jqXHR.statusText + ")",
          'Response headers': jqXHR.getAllResponseHeaders(),
          'Response body': jqXHR.responseText
        });
      }
      if (response_content) {
        if (response_content.error_message != undefined && response_content.traceback) {
          // An API exception
          blockingError({
            'Status': jqXHR.status,
            'Exception': response_content.error_message,
            'Backtrace': response_content.traceback
          })
        } else if (jqXHR.status == 400) {
          // A validation error
          validationError(response_content)
        } else {
          blockingError({
            'Status': jqXHR.status + "(" + jqXHR.statusText + ")",
            'Response headers': jqXHR.getAllResponseHeaders(),
            'Response body': response_content
          });
        }
      }
  }

  /* An unknown error which may have left the UI in an
   * inconsistent state: block the UI, disable further
   * API calls until the page is reloaded */
  function blockingError(kwargs)
  {
    errored = true;
    var message = "We are sorry, but something has gone wrong.";
    message += "<dl>";
    $.each(kwargs, function(key, value) {
      var s;

      if (_.isObject(value)) {
        try {
          s = JSON.stringify(value, null, 2);
        } catch (e) {
          // Does the object have a circular reference?
          s = String(value);
        }
      } else {
        s = String(value);
      }

      if (s.length > 160) {
        s = "<textarea rows='8' cols='40'>" + s + "</textarea>"
      }
      message += "<dt>" + key + ":</dt><dd>" + s + "</dd>";
    });
    message += "</dl>";

    /* NB: we 'reload' them back to the base URL because a malformed URL is a possible
     * cause of errors (e.g. if the hash had a bad ID in it) */
    $(`<div class='error_dialog'><h2>Error</h2>${message}</div>`).dialog({
      buttons: {
        Reload: {
          text: 'Reload',
          click: () => window.top.location = UI_ROOT
        }
      }
    })
  }

  /* A rejected request (400) -- assume that this was
   * a recoverable validation error and provide a generic
   * notification which will not block the UI */
  function validationError(field_errors)
  {
    var list_markup = "<dl>";
    traceback = field_errors.traceback;
    delete field_errors.traceback;
    $.each(field_errors, function(field, errors) {
      $.each(errors, function(i, error) {
        list_markup += "<dt>" + field + "</dt><dd>" + error + "</dd>";
      });
    });
    list_markup += "</dl>";

    var dialog_content = "<div class='error_dialog'><h2>Validation errors</h2>" + list_markup + "</div>";
    if (typeof traceback !== 'undefined') {
        var traceback_content = '<a href="#" onclick="$(\'#show_traceback\').toggle()">See more</a><div id="show_traceback" style="display:none">' + traceback + '</div>';
        dialog_content = "<div>" + dialog_content + traceback_content + "</div>";
    }

    $(dialog_content).dialog({
        buttons: {
          "Dismiss": {
            "text": "Dismiss",
            "class": "dismiss_button",
            "click": function() {
              $(this).dialog('close');
            }
          }
        }
    })
  }

  var get = function() {
    return call.apply(null, ["GET"].concat([].slice.apply(arguments)))
  };
  var post = function() {
    return call.apply(null, ["POST"].concat([].slice.apply(arguments)))
  };
  var put = function() {
    return call.apply(null, ["PUT"].concat([].slice.apply(arguments)))
  };
  var patch = function() {
    return call.apply(null, ["PATCH"].concat([].slice.apply(arguments)))
  };
  var del = function() {
    return call.apply(null, ["DELETE"].concat([].slice.apply(arguments)))
  };

  /* Wrap API calls to tastypie paginated methods such that
     jquery.Datatables understands the resulting format */
  var get_datatables = function(url, data, callbacks, settings, kwargs, datatable) {
    var success = function () {},
      error = null;

    if (typeof callbacks !== 'function') {
      success = callbacks.success;
      error = callbacks.error;
    } else {
      success = callbacks
    }

    if (kwargs == undefined) {
      kwargs = {}
    }

    /* Copy datatables args into our dict */
    if (data) {
      $.each(data, function(i, param) {
        kwargs[param.name] = param.value
      });
    }

    if (!kwargs.order_by && kwargs.iSortCol_0 != undefined) {
      if (kwargs['bSortable_' + kwargs.iSortCol_0]) {
        var order_by = settings.aoColumns[kwargs.iSortCol_0].mDataProp
        if (kwargs.sSortDir_0 == 'desc') {
          kwargs.order_by = "-" + order_by
        } else if (kwargs.sSortDir_0 == 'asc') {
          kwargs.order_by = order_by;
        }
      }
    }

    /* Rename pagination params from datatables to tastypie */
    if (kwargs.iDisplayLength == -1) {
      kwargs.limit = 0
    } else {
      kwargs.limit = kwargs.iDisplayLength
    }
    delete kwargs.iDisplayLength

    kwargs.offset = kwargs.iDisplayStart
    delete kwargs.iDisplayStart

    get(url, kwargs, success_callback = function(data) {
      var datatables_data = {}
      datatables_data.aaData = data.objects;
      datatables_data.iTotalRecords = data.meta.total_count
      datatables_data.iTotalDisplayRecords = data.meta.total_count
      success(datatables_data);
    }, error, false);
  };

  function lostContact ()
  {
    if (lost_contact) {
      return;
    } else {
      lost_contact = true;
      lost_contact_at = Number(Date.now())
      //console.log("Api: Lost contact at " + Date.now());

      testContact();
    }
  }

  function testContact ()
  {
    $.ajax({type: "GET", url: "/api/session/"}).complete(function(jqXHR) {
      if (jqXHR.status != 0) {
        lost_contact = false;
        //console.log("Api: Regained contact at " + Number(Date.now()));
        //console.log("Api: Out for " + (Number(Date.now()) - lost_contact_at)/1000 + " seconds");
        $('body').trigger('api_available');
        $('body').unbind('api_available');
      } else {
        //console.log("Api: Still out of contact at " + Date.now());
        //console.log("Api: " + calls_waiting + " calls waiting");
        //console.log("Api: Out for " + (Number(Date.now()) - lost_contact_at)/1000 + " seconds");
        setTimeout(testContact, CONTACT_RETRY_INTERVAL);
      }
    });
  }

  var call = function(verb, url, api_args, success_callback, error_callback, blocking, force, cache)
  {
    /* Allow user to pass either /filesystem or /api/filesystem */
    if (!(url.indexOf(API_PREFIX) == 0)) {
      url = API_PREFIX + url;
    }

    /* Permanent failures, do nothing */
    if (errored) {
      return;
    }

    /* Default to blocking calls */
    if (blocking == undefined) {
      blocking = true;
    }

    /* If .enable() hasn't been called yet (done after checking
     * user permissions), then defer this call until an event
     * is triggered */
    if ((!force && !api_available) || lost_contact) {
      calls_waiting += 1;
      $('body').bind('api_available', function() {
        calls_waiting -= 1;
        call(verb, url, api_args, success_callback, error_callback, blocking);
      });
      return;
    }

    var ajax_args = {
        type: verb,
        url: url,
        headers: {
          Accept: "application/json"
        }
    };

    if (verb == "GET") {
      ajax_args.data = $.param(api_args, true)
    } else {
      ajax_args.dataType = 'json';
      ajax_args.data = JSON.stringify(api_args);
      ajax_args.contentType ="application/json; charset=utf-8"
    }

    if (_.isBoolean(cache)) {
      ajax_args.cache = cache;
    }

    return $.ajax(ajax_args)
    .success(function(data, textStatus, jqXHR)
    {
      if (data && data.command) {
        CommandNotification.begin(data.command)
      }

      if (success_callback) {
        if(typeof(success_callback) == "function") {
          /* If success_callback is a function, call it */
          success_callback(data);
        } else {
          /* If success_callback is not a function, assume it
             is a lookup object of response code to callback */
          var status_code = jqXHR.status;
          if(success_callback[status_code] != undefined) {
            success_callback[status_code](data);
          } else {
            /* Caller gave us a lookup table of success callbacks
               but we got a response code that was successful but
               unhandled -- consider this a bug or error */
            unexpectedError(jqXHR);
          }
        }
      }
    })
    .error(function(jqXHR, textStatus)
    {
      if (jqXHR.status == 0 && jqXHR.statusText == "error") {
        if (verb == "GET" || verb == "PUT" || verb == "DELETE") {
          // For idempotent HTTP verbs, we can retry once
          // contact is reestablished
          lostContact();
          calls_waiting += 1;
          $('body').bind('api_available', function() {
            calls_waiting -= 1;
            call(verb, url, api_args, success_callback, error_callback, blocking, undefined, false)
          });
          return;
        }
        // For non-idempotent operations fall through to 'something has
        // gone wrong' to prompt the user to reload the UI as we can
        // no longer be sure of the state.
      } else if (jqXHR.status == 0 && (["abort", "canceled"].indexOf(jqXHR.statusText) !== -1)) {
        // Assume aborts are on purpose and let them pass without incident
        return;
      }
      if (error_callback) {
        if(typeof(error_callback) == "function") {
          /* Caller has provided a generic error handler */
          var rc = error_callback(jqXHR.responseText);
          if (rc instanceof Object && _.size(rc) > 0) {
            validationError(rc);
          } else if (rc == false) {
            unexpectedError(jqXHR);
          }
        } else if(typeof(error_callback) == "object") {
          var status_code = jqXHR.status;
          if(error_callback[status_code] != undefined) {
            /* Caller has provided handler for this status */
            var rc = error_callback[status_code](jqXHR);
            if (rc instanceof Object && _.size(rc) > 0) {
              validationError(rc);
            } else if (rc == false) {
              unexpectedError(jqXHR);
            }
          } else {
            /* Caller has provided some handlers, but not one for this
               status code, this is a bug or unhandled error */
            unexpectedError(jqXHR);
          }
        }
      } else {
        unexpectedError(jqXHR);
      }
    });
  };

  function busy()
  {
    return (outstanding_requests > 0)
  }

  function on_available(callback)
  {
    if (!api_available) {
      $('body').bind('api_available', function() {
        callback();
      });
    } else {
      callback()
    }
  }

  return {
    enable: enable,
    call : call,
    get: get,
    post: post,
    put: put,
    patch: patch,
    busy: busy,
    testMode: testMode,
    'delete': del,
    get_datatables: get_datatables,
    on_available: on_available,
    UI_ROOT: UI_ROOT
  }
}();

function removeBlankAttributes(obj) {
  $.each(obj, function(attr_name, attr_val) {
    if (attr_val == "") {
      delete obj[attr_name]
    }
  });
  return obj;
}
