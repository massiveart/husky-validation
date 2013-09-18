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
        'form/util': 'js/util',

        'type/default': 'js/types/default',
        'type/string': 'js/types/string',
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
    'form/validation',
    'form/util'
], function(Element, Validation, Util) {

    return function(el, options) {
        var defaults = {
                debug: false,                   // debug on/off
                validation: true,               // validation on/off
                validationTrigger: 'focusout',  // default validate trigger
                validationAddClasses: true,     // add error and success classes
                validationSubmitEvent: true,    // avoid submit if not valid
                mapper: true                    // mapper on/off
            },
            valid;

        // private functions
        var that = {
            // get form fields
            getFields: function() {
                return this.$el.find('input:not([data-form="false"], [type="submit"], [type="button"]), textarea:not([data-form="false"]), select:not([data-form="false"]), *[data-form="true"]');
            },

            initialize: function() {
                this.$el = $(el);
                this.options = $.extend(defaults, this.$el.data(), options);

                // enable / disable debug
                Util.debugEnabled = this.options.debug;

                that.initFields.call(this);

                if (!!this.options.validation) {
                    this.validation = new Validation(this);
                }

                this.$el.data('form-object', this);
                Util.debug('Form', this);
                Util.debug('Elements', this.elements);
            },

            // initialize field objects
            initFields: function() {
                $.each(that.getFields.call(this), function(key, value) {
                    var options = Util.parseData(value, '', this.options);
                    this.elements.push(new Element(value, options));
                    Util.debug('Element created', options);
                }.bind(this));
            },

            bindValidationDomEvents: function() {
                if (!!this.options.validationSubmitEvent) {
                    // avoid submit if not valid
                    this.$el.on('submit', function() {
                        return this.validation.validate();
                    }.bind(this));
                }
            }
        };

        var result = {
            elements: [],
            options: {},
            validation: false,
            mapper: false
        };

        that.initialize.call(result);
        return result;
    }

});
