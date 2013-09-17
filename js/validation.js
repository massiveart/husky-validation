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
    'js/element'
], function(Element) {

    return function($el, options) {
        var defaults = {
                submitEvent: true,          // avoid submit if not valid
                element: {                  // defaults for element
                    trigger: 'focusout',    // default validate trigger
                    addclasses: true        // add error and success classes
                }
            },
            elements = [],
            valid;

        var result = {
            initialize: function() {
                this.options = $.extend({}, defaults, options);
                this.$el = $el;

                // override defaults for element
                var elementDefaults = this.options['element'];

                // find to validate fields
                this.$el.find('*[data-validate="true"]').each(function() {
                    elements.push(new Element(this, elementDefaults));
                });

                // debug
                console.log('validation: elements', elements);

                this.bindDomEvents();
            },

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
                    var element = new Element($element,  this.options['element']);
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
