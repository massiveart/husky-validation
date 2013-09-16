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
    'js/validators/min',
    'js/validators/max',
    'js/validators/minlength',
    'js/validators/maxlength',
    'js/validators/required',
    'js/types/date',
    'js/types/decimal'
], function($, Min, Max, MinLength, MaxLength, Required, Date, Decimal) {

    return function(el, options) {
        var defaults = {
                trigger: 'focusout'
            },
            ignoredData = ['validate', 'type', 'prop'],
            providedValidators = {
                min: Min,
                max: Max,
                minlength: MinLength,
                maxlength: MaxLength,
                required: Required
            },
            providedTypes = {
                date: Date,
                decimal: Decimal
            },
            valid;

        var result = {
            initialize: function() {
                this.options = $.extend({}, defaults, options);

                this.$el = $(el);
                this.data = this.$el.data();

                // if data override options
                if (this.data.hasOwnProperty('trigger')) {
                    this.options.trigger = this.data.trigger;
                }

                this.initValidators();
                this.initType();

                this.bindDomEvents();

                // set element
                this.$el.data('element', this);

                // debug
                var prop = this.$el.data('prop');
                console.log(prop + ': validators', this.validators);
                console.log(prop + ': type', this.type);
            },

            bindDomEvents: function() {
                // build trigger
                var triggers = ( !this.options.trigger ? '' : this.options.trigger );

                // always bind change event, for better UX when a select is invalid
                if (this.$el.is('select')) {
                    triggers += new RegExp('change', 'i').test(triggers) ? '' : ' change';
                }

                // trim triggers to bind them correctly with .on()
                triggers = triggers.replace(/^\s+/g, '').replace(/\s+$/g, '');

                // bind event
                this.$el.bind(triggers, this.validate.bind(this));
            },

            initValidators: function() {
                this.validators = [];

                // create validators for each of the constraints
                $.each(this.data, function(key, val) {
                    // if a validator exists
                    if (providedValidators.hasOwnProperty(key) && !!val) {
                        this.validators.push(new providedValidators[key](this.$el));
                    }
                }.bind(this));
            },

            initType: function() {
                this.type = null;
                // if type exists
                if (this.data.hasOwnProperty('type') && providedTypes.hasOwnProperty(this.data['type'])) {
                    this.type = new providedTypes[this.data['type']](this.$el);
                }
            },

            validate: function() {
                if (!this.hasConstraints()) {
                    // delete state
                    this.reset();
                    return true;
                }

                var result = true;
                // check each validator
                $.each(this.validators, function(key, validator) {
                    if (!validator.validate()) {
                        result = false;
                    }
                });

                // check type
                if (this.type != null && !this.type.validate()) {
                    result = false;
                }

                this.setValid(result);
                return this.isValid();
            },

            hasConstraints: function() {
                return this.validators.length > 0 || this.type != null;
            },

            reset: function() {
                this.$el.removeClass('husky-validate-success');
                this.$el.removeClass('husky-validate-error');
            },

            setValid: function(state) {
                valid = state;
                this.reset();

                if (!!state) {
                    this.$el.addClass('husky-validate-success');
                } else {
                    this.$el.addClass('husky-validate-error');
                }
            },

            isValid: function() {
                return valid;
            }
        };

        result.initialize();
        return result;
    };

});
