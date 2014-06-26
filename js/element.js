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

    'use strict';

    return function(el, form, options) {

        var defaults = {
                type: null,
                validationTrigger: 'focusout',                     // default validate trigger
                validationAddClasses: true,                        // add error and success classes
                validationAddClassesParent: true,                  // add classes to parent element
                validationErrorClass: 'husky-validate-error',      // error class
                validationClass: 'husky-validate',                 // default class
                validation: true                                   // validation on/off
            },
            ignoredOptions = [
                'validation',
                'validationTrigger',
                'validationAddClasses',
                'validationAddClassesParent',
                'validationClass',
                'validationErrorClass',
                'validationSubmitEvent'
            ],
            valid,
            validators = {},
            type,
            lastValue = null,
            dfd = null,

            that = {
                initialize: function() {
                    dfd = $.Deferred();
                    this.requireCounter = 0;
                    this.initialized = dfd.promise();

                    this.$el = $(el);

                    // set data element
                    this.$el.data('element', this);

                    this.options = $.extend({}, defaults, options);

                    if (!!this.options.validationAddClasses) {
                        this.$el.addClass(this.options.validationClass);
                    }

                    // init validation if necessary
                    if (!!this.options.validation) {
                        that.initValidation.call(this);
                    }
                },

                resolveInitialization: function() {
                    this.requireCounter--;
                    if (this.requireCounter === 0) {
                        dfd.resolve();
                    }
                },

                initValidation: function() {
                    that.bindValidationDomEvents.call(this);

                    that.initValidators.call(this);
                    that.initType.call(this);
                },

                bindValidationDomEvents: function() {
                    // build trigger
                    var triggers = ( !this.options.validationTrigger ? '' : this.options.validationTrigger );

                    // break if no trigger is set
                    if (triggers === '' || triggers === 'none') {
                        return;
                    }

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
                    var addFunction = function(name, options) {
                        this.requireCounter++;
                        require(['validator/' + name], function(Validator) {
                            validators[name] = new Validator(this.$el, form, this, options);
                            Util.debug('Element Validator', name, options);
                            that.resolveInitialization.call(this);
                        }.bind(this));
                    }.bind(this);

                    // create validators for each of the constraints
                    $.each(this.options, function(key, val) {
                        // val not false
                        // key is not ignored
                        // and key starts with validation
                        if (!!val && $.inArray(key, ignoredOptions) === -1 && Util.startsWith(key, 'validation')) {
                            // filter validation prefix
                            var name = Util.lcFirst(key.replace('validation', '')),
                                options = Util.buildOptions(this.options, 'validation', name);

                            addFunction(name, options);
                        }
                    }.bind(this));

                    // HTML 5 attributes
                    // required
                    if (this.$el.attr('required') === 'required' && !validators.required) {
                        addFunction('required', {required: true});
                    }
                    // min
                    if (!!this.$el.attr('min') && !validators.min) {
                        addFunction('min', {min: parseInt(this.$el.attr('min'), 10)});
                    }
                    // max
                    if (!!this.$el.attr('max') && !validators.max) {
                        addFunction('max', {max: parseInt(this.$el.attr('max'), 10)});
                    }
                    // regex
                    if (!!this.$el.attr('pattern') && !validators.pattern) {
                        addFunction('regex', {regex: this.$el.attr('pattern')});
                    }
                },

                initType: function() {
                    var addFunction = function(typeName, options) {
                            this.requireCounter++;
                            require(['type/' + typeName], function(Type) {
                                type = new Type(this.$el, options, form);

                                type.initialized.then(function() {
                                    Util.debug('Element Type', typeName, options);
                                    that.resolveInitialization.call(this);
                                }.bind(this));

                            }.bind(this));
                        }.bind(this),
                        options = Util.buildOptions(this.options, 'type'),
                        typeName, tmpType;

                    // FIXME date HTML5 type browser language format

                    // if type exists
                    if (!!this.options.type) {
                        typeName = this.options.type;
                    } else if (!!this.$el.attr('type')) {
                        // HTML5 type attribute
                        tmpType = this.$el.attr('type');
                        if (tmpType === 'email') {
                            typeName = 'email';
                        } else if (tmpType === 'url') {
                            typeName = 'url';
                        } else if (tmpType === 'number') {
                            typeName = 'decimal';
                        } else if (tmpType === 'date') {
                            typeName = 'date';
                            if (!!options.format) {
                                options.format = 'd';
                            }
                        } else if (tmpType === 'time') {
                            typeName = 'date';
                            if (!!options.format) {
                                options.format = 't';
                            }
                        } else if (tmpType === 'datetime') {
                            typeName = 'date';
                        } else {
                            typeName = 'string';
                        }
                    } else {
                        typeName = 'string';
                    }
                    addFunction(typeName, options);
                },

                hasConstraints: function() {
                    var typeConstraint = (!!type && type.needsValidation()),
                        validatorsConstraint = Object.keys(validators).length > 0;

                    return validatorsConstraint || typeConstraint;
                },

                needsValidation: function() {
                    return lastValue !== Util.getValue(this.$el);
                },

                reset: function() {
                    var $element = this.$el;
                    if (!!this.options.validationAddClassesParent) {
                        $element = $element.parent();
                    }
                    $element.removeClass(this.options.validationErrorClass);
                },

                setValid: function(state) {
                    valid = state;
                    if (!!this.options.validationAddClasses) {
                        that.reset.call(this);

                        var $element = this.$el;
                        if (!!this.options.validationAddClassesParent) {
                            $element = $element.parent();
                        }
                        if (!state) {
                            $element.addClass(this.options.validationErrorClass);
                        }
                    }
                }
            },

            result = {
                validate: function(force) {
                    var result = true,
                        validated = false;

                    // only if value changed or force is set
                    if (force || that.needsValidation.call(this)) {
                        if (that.hasConstraints.call(this)) {
                            // check each validator
                            $.each(validators, function (key, validator) {
                                if (!validator.validate()) {
                                    result = false;
                                    // TODO Messages
                                }
                            });
                            validated = true;
                        }
                    }

                    // check type
                    if (!!type && type.needsValidation()) {
                        if (!type.validate()) {
                            result = false;
                        }
                        validated = true;
                    }

                    // set css classes
                    if (validated === true) {
                        if (!result) {
                            Util.debug('Field validate', !!result ? 'true' : 'false', this.$el);
                        }
                        that.setValid.call(this, result);
                    }

                    return result;
                },

                update: function() {
                    if (!that.hasConstraints.call(this)) {
                        // delete state
                        //that.reset.call(this);
                        return true;
                    }

                    var result = true;
                    // check each validator
                    $.each(validators, function(key, validator) {
                        if (!validator.update()) {
                            result = false;
                            // TODO Messages
                        }
                    });

                    // check type
                    if (type !== null && !type.validate()) {
                        result = false;
                    }

                    if (!result) {
                        Util.debug('Field validate', !!result ? 'true' : 'false', this.$el);
                    }
                    that.setValid.call(this, result);

                    return result;
                },

                isValid: function() {
                    return valid;
                },

                updateConstraint: function(name, options) {
                    if ($.inArray(name, Object.keys(validators)) > -1) {
                        validators[name].updateConstraint(options);
                        this.validate();
                    } else {
                        throw 'No constraint with name: ' + name;
                    }
                },

                deleteConstraint: function(name) {
                    if ($.inArray(name, Object.keys(validators)) > -1) {
                        delete validators[name];
                        this.validate(true);
                    } else {
                        throw 'No constraint with name: ' + name;
                    }
                },

                addConstraint: function(name, options) {
                    if ($.inArray(name, Object.keys(validators)) === -1) {
                        require(['validator/' + name], function(Validator) {
                            validators[name] = new Validator(this.$el, form, this, options);
                        }.bind(this));
                    } else {
                        throw 'Constraint with name: ' + name + ' already exists';
                    }
                },

                hasConstraint: function(name) {
                    return !!validators[name];
                },

                getConstraint: function(name) {
                    if (!this.hasConstraint(name)) {
                        return false;
                    }
                    return validators[name];
                },

                fieldAdded: function(element) {
                    $.each(validators, function(key, validator) {
                        // FIXME better solution? perhaps only to interested validators?
                        validator.fieldAdded(element);
                    });
                },

                fieldRemoved: function(element) {
                    $.each(validators, function(key, validator) {
                        // FIXME better solution? perhaps only to interested validators?
                        validator.fieldRemoved(element);
                    });
                },

                setValue: function(value) {
                    var dfd = $.Deferred(),
                        result;

                    this.initialized.then(function() {
                        result = type.setValue(value);

                        // if setvalue returns a deferred wait for that
                        if (!!result) {
                            result.then(function() {
                                dfd.resolve();
                            });
                        } else {
                            dfd.resolve();
                        }
                    }.bind(this));

                    return dfd.promise();
                },

                getValue: function(data) {
                    return type.getValue(data);
                },

                getType: function() {
                    return type;
                }
            };

        that.initialize.call(result);
        return result;
    };

});
