/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define([
    'form/util'
], function(Util) {

    return function(form) {
        var valid;

        // private functions
        var that = {
            initialize: function() {
                Util.debug('INIT Mapper');
            }
        };

        // define mapper interface
        var result = {
            setData: function(data, $el) {
                if (!$el)$el = form.$el;
                $.each(data, function(key, value) {
                    // search field with mapper property
                    var selector = '*[data-mapper-property="' + key + '"]',
                        $element = $el.find(selector),
                        element = $element.data('element');

                    // if field is an array
                    if ($.isArray(value)) {
                        // remember first child remove the rest
                        var $child = $element.children().first();

                        // remove fields
                        $.each(Util.getFields($element), function(key, value) {
                            form.removeField(value);
                        }.bind(this));
                        $element.children().remove();

                        // foreach array elements: create a new dom element, call setData recursively
                        $.each(value, function(key1, value1) {
                            var $newElement = $child.clone();
                            $element.append($newElement);
                            form.mapper.setData(value1, $newElement);
                        });
                    } else {
                        // if element is not in form add it
                        if (!element) {
                            element = form.addField($element);
                            // FIXME wait for type (async load)
                            setTimeout(function() {
                                element.setValue(value)
                            }, 100);
                        } else {
                            element.setValue(value);
                        }
                    }
                }.bind(this));
            },

            getData: function() {
                var data = {};
                $.each(form.elements, function(key, value) {
                    value.getData(data);
                }.bind(this));
                return data;
            }
        };

        that.initialize.call(result);
        return result;
    }

});
