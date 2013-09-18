/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

require.config({
    paths: {
        'form': 'js/form',
        'form/mapper': 'js/mapper',
        'form/validation': 'js/validation',
        'form/element': 'js/element',
        'form/optionsParser': 'js/options-parser',

        'type/default': 'js/types/default',
        'type/date': 'js/types/date',
        'type/decimal': 'js/types/decimal',
        'type/email': 'js/types/email',
        'type/url': 'js/types/url',

        'validator/default': 'js/validators/default',
        'validator/min': 'js/validators/min',
        'validator/max': 'js/validators/max',
        'validator/minLength': 'js/validators/min-length',
        'validator/maxLength': 'js/validators/max-length',
        'validator/required': 'js/validators/required'
    }
});

define([
    'form/element',
    'form/optionsParser'
], function(Element, OptionsParser) {

    return function(el, options) {
        var defaults = {
                debug: false
            },
            elements = [];

        // private functions
        var that = {
            // get form fields
            getFields: function() {
                return this.$el.find('input:not([data-form="false"], [type="submit"], [type="button"]), textarea:not([data-form="false"]), select:not([data-form="false"]), *[data-form="true"]');
            },

            initialize: function() {
                this.$el = $(el);
                this.options = $.extend({}, defaults, options);

                that.initFields.call(this);

                this.$el.data('form-object', this);
                this.debug('Form', this);
                this.debug('Elements', elements);
            },

            // initialize field objects
            initFields: function() {
                $.each(that.getFields.call(this), function(key, value) {
                    var options = OptionsParser.parseOptions($(value), 'form', {});
                    elements.push(new Element(value), options);
                }.bind(this));
            }
        };

        var result = {
            debug: function(p1, p2, p3) {
                if (!!this.options.debug) {
                    if (!!p1) {
                        if (!!p2) {
                            if (!!p3) {
                                console.log("Husky Validation", p1, p2, p3)
                            } else {
                                console.log("Husky Validation", p1, p2)
                            }
                        } else {
                            console.log("Husky Validation", p1)
                        }
                    } else {
                        console.log("Husky Validation")
                    }
                }
            }
        };

        that.initialize.call(result);
        return result;
    }

});
