//
// Copyright (c) 2018 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

// Intended to house link builders and tag generators for common elements
var UIHelper = function() {


  // build a tag
  // tag
  // options:
  //    - content : str; stuff to put inside the tag (default: '')
  //                (non-zero length forces close_tag to be true)
  //    - properties : obj; properties to add to the tag (default {})
  //    - close_tag : bool; whether to close the tag or not (default false);
  // NOTE: properties are assumed to have keys that are html safe and the values pre-escaped
  // It is unsafe to pass in properties from external sources
  function build_tag(tag, options) {

    var _options = _.defaults({ close_tag: false }, options || {} );

    var html = '<' + tag;
    if ( _.isObject(_options.properties) ) {
      html += ' ' + _.map(
                        _options.properties,
                        function(value, property) { return property + "='" + value + "'"; }
                      ).join(' ');
    }
    html += '>';

    if ( _.isString(_options.content) && _options.content.length > 0 ) {
      html += _options.content;
      _options.close_tag = true;
    }
    if ( _options.close_tag ) {
      html += '</' + tag + '>';
    }

    return html;
  }

  // build an i tag to a font-awesome icon
  // name: font-awesome classname
  // data: (optional) props to pass to the element builder
  function fugue_icon(name, properties) {
    var _properties = _.defaults({ class: name }, properties || {});
    return build_tag('i', { properties: _properties } );
  }

  // build a help link (help.js)
  // topic: req'd ;html filename of contextual help (without the .html file ext)
  // content: req'd for link_type hover or button; link/button content
  // properties: optional; other html properties you'd like applied to the link
  function _help_link(link_type, topic, content, properties) {
    var _properties = _.defaults({ 'class': '' }, properties || {}, { 'data-topic': topic })
    _properties['class'] = link_type + ' ' + _properties['class'];
    return build_tag('a', { content: content, properties: _properties } );
  }

  // dispatchers to _help_link
  // build a hoverin tooltip over content
  function help_hover(topic,content,properties) {
    return _help_link('help_hover', topic, content, properties);
    // OR return _help_link.apply(['help_hover'].concat([].slice.apply(arguments))) !
  }
  // build a help button with text
  function help_button(topic, content, properties) {
    return _help_link('help_button', topic, content, properties );
  }
  // build a small help button with just ?
  function help_button_small( topic, properties) {
    return _help_link('help_button_small', topic, undefined, properties);
  }

  return {
    build_tag: build_tag,
    fugue_icon: fugue_icon,
    help_hover: help_hover,
    help_button: help_button,
    help_button_small: help_button_small
  };

}();
