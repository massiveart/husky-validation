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
    'jquery',
    'js/element'
], function($, Element) {

    return function($el, options) {
        var defaults = {},
            elements = [],
            valid;

        var result = {
            initialize: function() {
                this.options = $.extend({}, defaults, options);
                this.$el = $el;

                var defaults = {};
                if (this.options.hasOwnProperty('default-trigger')) {
                    defaults['trigger'] = this.options['default-trigger'];
                }

                this.$el.find('*[data-validate="true"]').each(function() {
                    elements.push(new Element(this, defaults));
                });
                console.log('validation: elements', elements);

                this.bindDomEvents();
            },

            bindDomEvents: function() {
                this.$el.on('submit', function() {
                    return this.validate();
                }.bind(this));
            },

            validate: function() {
                var result = true;
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
            }
        };

        result.initialize();
        return result;
    };
});
