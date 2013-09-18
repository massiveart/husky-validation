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
    'form/util'
], function(Element, Util) {

    return function(el, options) {
        var defaults = {
                debug: false,                   // debug on/off
                validation: true,               // validation initialization on/off
                validationTrigger: 'focusout',  // default validate trigger
                validationAddClasses: true,     // add error and success classes
                validationSubmitEvent: true     // avoid submit if not valid
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
                this.options = $.extend(defaults, this.$el.data(), options);

                // enable / disable debug
                Util.debugEnabled = this.options.debug;

                that.initFields.call(this);

                this.$el.data('form-object', this);
                Util.debug('Form', this);
                Util.debug('Elements', elements);
            },

            // initialize field objects
            initFields: function() {
                $.each(that.getFields.call(this), function(key, value) {
                    var options = Util.parseData(value, '', this.options);

                    elements.push(new Element(value, options));
                    Util.debug('Element created', options);
                }.bind(this));
            }
        };

        // define validation interface
        var validation = {

        };

        var result = {
        };

        that.initialize.call(result);
        return result;
    }

});
