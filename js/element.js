/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define([], function() {

    return function(el, options) {
        var defaults = {
                trigger: 'focusout',                    // default validate trigger
                addClasses: true,                       // add error and success classes
                successClass: 'husky-validate-success', // success class
                errorClass: 'husky-validate-error'      // error class
            },
            ignoredOptions = ['type', 'property', 'trigger', 'addClasses'],
            valid,
            validators = {},
            type;

        var that = {
            initialize: function() {
                this.$el = $(el);

                // set data element
                this.$el.data('element', this);

                this.options = $.extend({}, defaults, options);
                that.bindDomEvents.call(this);

                that.initValidators.call(this);
                that.initType.call(this);
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
                // create validators for each of the constraints
                $.each(this.options, function(key, val) {
                    // if a validator exists
                    if ($.inArray(key, ignoredOptions) == -1 && !!val) {
                        require(['validator/' + key], function(Validator) {
                            validators[key] = new Validator(this.$el);
                        }.bind(this));
                    }
                }.bind(this));
            },

            initType: function() {
                // if type exists
                if (!!this.options.type) {
                    require(['type/' + this.options.type], function(Type) {
                        type = new Type(this.$el);
                    }.bind(this));
                }
            },

            hasConstraints: function() {
                return Object.keys(validators).length > 0 || this.type != null;
            },

            reset: function() {
                this.$el.removeClass(this.options.successClass);
                this.$el.removeClass(this.options.errorClass);
            },

            setValid: function(state) {
                valid = state;
                if (!!this.options.addclasses) {
                    this.reset.call(this);

                    if (!!state) {
                        this.$el.addClass(this.options.successClass);
                    } else {
                        this.$el.addClass(this.options.errorClass);
                    }
                }
            }
        };

        var result = {
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
                    require(['validator/' + name], function(Validator) {
                        this.validators[name] = new Validator(this.$el, options);
                        this.validate(true);
                    }.bind(this));
                } else {
                    throw "Constraint with name: " + name + " already exists";
                }
            }
        };

        that.initialize.call(result);
        return result;
    };

});
