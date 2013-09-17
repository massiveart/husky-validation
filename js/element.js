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
        min: 'js/validators/min',
        max: 'js/validators/max',
        minlength: 'js/validators/minlength',
        maxlength: 'js/validators/maxlength',
        required: 'js/validators/required',
        date: 'js/types/date',
        decimal: 'js/types/decimal',
        email: 'js/types/email',
        url: 'js/types/url'
    }
});

define([], function() {

    return function(el, options) {
        var defaults = {
                trigger: 'focusout',    // default validate trigger
                addclasses: true        // add error and success classes
            },
            ignoredData = ['validate', 'type', 'prop', 'trigger'],
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
                // break if no trigger is set
                if (triggers === '' || triggers === 'none')return;

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
                this.validators = {};

                // create validators for each of the constraints
                $.each(this.data, function(key, val) {
                    // if a validator exists
                    if ($.inArray(key, ignoredData) == -1 && !!val) {
                        require([key], function(Validator) {
                            this.validators[key] = new Validator(this.$el);
                        }.bind(this));
                    }
                }.bind(this));
            },

            initType: function() {
                this.type = null;
                // if type exists
                if (this.data.hasOwnProperty('type')) {
                    require([this.data['type']], function(Type) {
                        this.type = new Type(this.$el);
                    }.bind(this));
                }
            },

            validate: function(force) {
                // TODO cache only if value changed or force is set
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
                        // TODO Messages
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
                return Object.keys(this.validators).length > 0 || this.type != null;
            },

            reset: function() {
                this.$el.removeClass('husky-validate-success');
                this.$el.removeClass('husky-validate-error');
            },

            setValid: function(state) {
                valid = state;
                if (!!this.options.addclasses) {
                    this.reset();

                    if (!!state) {
                        this.$el.addClass('husky-validate-success');
                    } else {
                        this.$el.addClass('husky-validate-error');
                    }
                }
            },

            isValid: function() {
                return valid;
            },

            updateConstraint: function(name, options) {
                if ($.inArray(name, Object.keys(this.validators)) > -1) {
                    this.validators[name].updateConstraint(options);
                    this.validate(true);
                } else {
                    throw "No constraint with name: " + name;
                }
            },
            deleteConstraint: function(name) {
                if ($.inArray(name, Object.keys(this.validators)) > -1) {
                    delete this.validators[name];
                    this.$el.removeData(name);
                    this.validate(true);
                } else {
                    throw "No constraint with name: " + name;
                }
            },

            addConstraint: function(name, options) {
                if ($.inArray(name, Object.keys(this.validators)) == -1) {
                    require([name], function(Validator) {
                        this.validators[name] = new Validator(this.$el, options);
                        this.validate(true);
                    }.bind(this));
                } else {
                    throw "Constraint with name: " + name + " already exists";
                }
            }
        };

        result.initialize();
        return result;
    };

});
