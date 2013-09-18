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
    'validation-element'
], function(Element) {

    return function() {
        var defaults = {
            },
            elements = [],
            valid;

        var result = {
            bindDomEvents: function() {
                if (!!this.options.submitEvent) {
                    // avoid submit if not valid
                    this.$el.on('submit', function() {
                        return this.validate();
                    }.bind(this));
                }
            },

            validate: function() {
                var result = true;
                // validate each element
                $.each(elements, function(key, element) {
                    if (!element.validate()) {
                        result = false;
                    }
                });

                valid = result;
                return result;
            },

            isValid: function() {
                return valid;
            },

            updateConstraint: function(selector, name, options) {
                var $element = $(selector);
                if (!!$element.data('element')) {
                    $(selector).data('element').updateConstraint(name, options);
                } else {
                    throw 'No validation element';
                }
            },

            deleteConstraint: function(selector, name) {
                var $element = $(selector);
                if (!!$element.data('element')) {
                    $element.data('element').deleteConstraint(name);
                } else {
                    throw 'No validation element';
                }
            },

            addConstraint: function(selector, name, options) {
                var $element = $(selector);
                if (!!$element.data('element')) {
                    $element.data('element').addConstraint(name, options);
                } else {
                    // create a new one
                    var element = new Element($element, this.options['element']);
                    // add constraint
                    element.addConstraint(name, options);
                    elements.push(element);
                }
            }
        };

        result.initialize();
        return result;
    };
});
