//
// Copyright (c) 2017 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.


var Target = Backbone.Model.extend({
  urlRoot: "/api/target/"
});

var TargetDetail = Backbone.View.extend({
  className: 'target_detail',
  template: _.template($('#target_detail_template').html()),
  render: function () {
    var cleanModel = this.model.toJSON();
    var rendered = this.template({target: cleanModel});
    var view = this;
    $(this.el).find('.ui-dialog-content').html(rendered);
    $(this.el).find('.tabs').tabs({'show': function(event, ui) {view.tab_select(event, ui)}});

    var generateCommandDropdown = angular.element('html').injector().get('generateCommandDropdown');
    generateCommandDropdown.generateDropdown($(this.el).find('div[command-dropdown]'), cleanModel);

    var conf_params = this.model.get('conf_params');
    if (conf_params != null && !this.model.get('immutable_state')) {
      $(this.el).find(".conf_param_table").dataTable( {
        "iDisplayLength":30,
        "bProcessing": true,
        "bJQueryUI": true,
        "bPaginate" : false,
        "bSort": false,
        "bFilter" : false,
        "bAutoWidth":false,
        "aoColumns": [
          { "sClass": 'txtleft' },
          { "sClass": 'txtcenter' },
          { "bVisible": false }
        ]
      });

      populate_conf_param_table(conf_params, $(this.el).find(".conf_param_table"));
      ContextualHelp.load_snippets('#target_dialog_config_param_tab');
    }

    return this;
  },
  conf_param_apply: function() {
    apply_config_params(
      this.model.toJSON(),
      $(this.el).find(".conf_param_table").dataTable());
  },
  conf_param_reset: function () {
    var dataTable = $(this.el).find('.conf_param_table').dataTable();

    window.reset_config_params(dataTable);
    this.conf_param_apply(dataTable);
  },
  conf_param_cancel: function () {
    window.cancel_config_params($(this.el).find('.conf_param_table').dataTable());
  },
  tab_select: function(event, ui) {
    var view = this;
    var tab = ui.panel.id;
    if (tab == 'devices_tab') {
      Api.get(this.model.get('volume').resource_uri, {}, function(data) {
        var storage_resource_uri = data.storage_resource;
        var storage_resource_id = storage_resource_uri.split("/")[3];
        Api.get('/api/storage_resource/', {ancestor_of: storage_resource_id}, function(data) {
          var template = _.template($('#storage_resource_list_template').html());
          var storage_resources = data.objects;

          // Filter out device nodes
          var filtered_storage_resources = [];
          _.each(storage_resources, function(resource) {
            if (!_.include(resource.parent_classes, "DeviceNode")) {
              filtered_storage_resources.push(resource);
            }
          });


          var markup = template({'storage_resources': filtered_storage_resources});
          $(view.el).find('#devices_tab').html(markup);
        });
      });
    }
  },
  events: {
    "click .conf_param_apply": "conf_param_apply",
    "click .conf_param_reset": "conf_param_reset",
    'click .conf_param_cancel': 'conf_param_cancel'
  }
});
