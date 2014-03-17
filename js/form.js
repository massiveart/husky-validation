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
        'type/static-text': 'js/types/staticText',
        'type/string': 'js/types/string',
        'type/date': 'js/types/date',
        'type/decimal': 'js/types/decimal',
        'type/email': 'js/types/email',
        'type/url': 'js/types/url',
        'type/label': 'js/types/label',
        'type/select': 'js/types/select',
        'type/collection': 'js/types/collection',

        'validator/default': 'js/validators/default',
        'validator/min': 'js/validators/min',
        'validator/max': 'js/validators/max',
        'validator/minLength': 'js/validators/min-length',
        'validator/maxLength': 'js/validators/max-length',
        'validator/required': 'js/validators/required',
        'validator/unique': 'js/validators/unique',
        'validator/equal': 'js/validators/equal',
        'validator/regex': 'js/validators/regex'
    }
});

define([
    'form/element',
    'form/validation',
    'form/mapper',
    'form/util'
], function(Element, Validation, Mapper, Util) {

    'use strict';

    return function(el, options) {
        var defaults = {
                debug: false,                     // debug on/off
                validation: true,                 // validation on/off
                validationTrigger: 'focusout',    // default validate trigger
                validationAddClassesParent: true, // add classes to parent element
                validationAddClasses: true,       // add error and success classes
                validationSubmitEvent: true,      // avoid submit if not valid
                mapper: true                      // mapper on/off
            },
            dfd = null,

        // private functions
            that = {
                initialize: function() {
                    // init initialized
                    dfd = $.Deferred();
                    this.requireCounter = 0;
                    this.initialized = dfd.promise();

                    this.$el = $(el);
                    this.options = $.extend(defaults, this.$el.data(), options);

                    // enable / disable debug
                    Util.debugEnabled = this.options.debug;

                    that.initFields.call(this);

                    if (!!this.options.validation) {
                        this.validation = new Validation(this);
                    }

                    if (!!this.options.mapper) {
                        this.mapper = new Mapper(this);
                    }

                    this.$el.data('form-object', this);
                    Util.debug('Form', this);
                    Util.debug('Elements', this.elements);
                },

                // initialize field objects
                initFields: function() {
                    $.each(Util.getFields(this.$el), function(key, value) {
                        this.requireCounter++;
                        that.addField.call(this, value, false).initialized.then(function() {
                            that.resolveInitialization.call(this);
                        }.bind(this));
                    }.bind(this));
                },

                resolveInitialization: function() {
                    this.requireCounter--;
                    if (this.requireCounter === 0) {
                        dfd.resolve();
                    }
                },

                bindValidationDomEvents: function() {
                    if (!!this.options.validationSubmitEvent) {
                        // avoid submit if not valid
                        this.$el.on('submit', function() {
                            return this.validation.validate();
                        }.bind(this));
                    }
                },

                addField: function(selector) {
                    var $element = $(selector),
                        options = Util.parseData($element, '', this.options),
                        element = new Element($element, this, options);

                    this.elements.push(element);
                    Util.debug('Element created', options);
                    return element;
                }
            },

            result = {
                elements: [],
                options: {},
                validation: false,
                mapper: false,

                addField: function(selector) {
                    var element = that.addField.call(this, selector);

                    element.initialized.then(function() {
                        // say everybody I have a new field
                        // FIXME better solution?
                        $.each(this.elements, function(key, element) {
                            element.fieldAdded(element);
                        });
                    }.bind(this));

                    return element;
                },

                removeField: function(selector) {
                    var $element = $(selector),
                        el = $element.data('element');

                    // say everybody I have a lost field
                    // FIXME better solution?
                    $.each(this.elements, function(key, element) {
                        element.fieldRemoved(el);
                    });

                    this.elements.splice(this.elements.indexOf(el), 1);
                }
            };

        that.initialize.call(result);
        return result;
    };

});
