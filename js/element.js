/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define(['form/util'], function(Util) {

    return function(el, options) {
        var defaults = {
                trigger: 'focusout',                    // default validate trigger
                addClasses: true,                       // add error and success classes
                successClass: 'husky-validate-success', // success class
                errorClass: 'husky-validate-error'      // error class
            },
            ignoredOptions = ['type', 'property', 'trigger', 'addClasses', 'successClass', 'errorClass'],
            valid,
            validators = {},
            type,
            lastValue = "";

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
                            var options = Util.buildOptions(this.options, key);
                            validators[key] = new Validator(this.$el, options);
                            Util.debug('Element Validator', key);
                        }.bind(this));
                    }
                }.bind(this));
            },

            initType: function() {
                // if type exists
                if (!!this.options.type) {
                    require(['type/' + this.options.type], function(Type) {
                        var options = Util.buildOptions(this.options, type);
                        type = new Type(this.$el, options);
                        Util.debug('Element Type', type);
                    }.bind(this));
                }
            },

            hasConstraints: function() {
                return Object.keys(validators).length > 0 || type != null;
            },

            needsValidation: function() {
                return lastValue !== this.$el.val();
            },

            reset: function() {
                this.$el.removeClass(this.options.successClass);
                this.$el.removeClass(this.options.errorClass);
            },

            setValid: function(state) {
                valid = state;
                if (!!this.options.addClasses) {
                    that.reset.call(this);

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
                // only if value changed or force is set
                if (force || that.needsValidation.call(this)) {
                    if (!that.hasConstraints.call(this)) {
                        // delete state
                        that.reset.call(this);
                        return true;
                    }

                    var result = true;
                    // check each validator
                    $.each(validators, function(key, validator) {
                        if (!validator.validate()) {
                            result = false;
                            // TODO Messages
                        }
                    });

                    // check type
                    if (type != null && !type.validate()) {
                        result = false;
                    }

                    that.setValid.call(this, result);
                }
                return this.isValid();
            },

            isValid: function() {
                return valid;
            },

            updateConstraint: function(name, options) {
                if ($.inArray(name, Object.keys(validators)) > -1) {
                    validators[name].updateConstraint(options);
                    this.validate(true);
                } else {
                    throw "No constraint with name: " + name;
                }
            },
            deleteConstraint: function(name) {
                if ($.inArray(name, Object.keys(validators)) > -1) {
                    delete validators[name];
                    this.validate(true);
                } else {
                    throw "No constraint with name: " + name;
                }
            },

            addConstraint: function(name, options) {
                if ($.inArray(name, Object.keys(validators)) == -1) {
                    require(['validator/' + name], function(Validator) {
                        validators[name] = new Validator(this.$el, options);
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
