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
        'form/elementGroup': 'js/elementGroup',
        'form/util': 'js/util',

        'type/default': 'js/types/default',
        'type/readonly-select': 'js/types/readonlySelect',
        'type/string': 'js/types/string',
        'type/date': 'js/types/date',
        'type/decimal': 'js/types/decimal',
        'type/hiddenData': 'js/types/hiddenData',
        'type/mappingData': 'js/types/mappingData',
        'type/email': 'js/types/email',
        'type/url': 'js/types/url',
        'type/label': 'js/types/label',
        'type/select': 'js/types/select',
        'type/collection': 'js/types/collection',
        'type/attributes': 'js/types/attributes',

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
    'form/elementGroup',
    'form/validation',
    'form/mapper',
    'form/util'
], function(Element, ElementGroup, Validation, Mapper, Util) {

    'use strict';

    return function(el, options) {
        var defaults = {
                debug: false,                     // debug on/off
                delimiter: {                      // defines which delimiter should be used for templating
                    interpolate: /<~=(.+?)~>/g,
                    escape: /<~-(.+?)~>/g,
                    evaluate: /<~(.+?)~>/g
                },
                validation: true,                 // validation on/off
                validationTrigger: 'focusout',    // default validate trigger
                validationAddClassesParent: true, // add classes to parent element
                validationAddClasses: true,       // add error and success classes
                validationSubmitEvent: true,      // avoid submit if not valid
                mapper: true                      // mapper on/off
            },

        // private functions
            that = {
                initialize: function() {
                    this.$el = $(el);
                    this.options = $.extend(defaults, this.$el.data(), options);

                    // enable / disable debug
                    Util.debugEnabled = this.options.debug;

                    this.initialized = that.initFields.call(this);

                    if (!!this.options.validation) {
                        this.validation = new Validation(this);
                    }

                    if (!!this.options.mapper) {
                        this.mapper = new Mapper(this);
                    }

                    this.$el.data('form-object', this);
                },

                // initialize field objects
                initFields: function($el) {
                    var dfd = $.Deferred(),
                        requireCounter = 0,
                        resolve = function() {
                            requireCounter--;
                            if (requireCounter === 0) {
                                dfd.resolve();
                            }
                        };

                    $.each(Util.getFields($el || this.$el), function(key, value) {
                        requireCounter++;
                        that.addField.call(this, value).initialized.then(resolve.bind(this));
                    }.bind(this));

                    that.addGroupedFields.call(this, $el);

                    return dfd.promise();
                },

                bindValidationDomEvents: function() {
                    if (!!this.options.validationSubmitEvent) {
                        // avoid submit if not valid
                        this.$el.on('submit', function() {
                            return this.validation.validate();
                        }.bind(this));
                    }
                },

                createField: function(selector) {
                    var $element = $(selector),
                        options = Util.parseData($element, '', this.options);

                    return new Element($element, result, options);
                },

                createFieldGroup: function(selectors, single) {
                    return new ElementGroup(
                        selectors.map(function(selector) {
                            var $element = $(selector),
                                options = Util.parseData($element, '', this.options);

                            return new Element($element, result, options);
                        }.bind(this)),
                        single
                    );
                },

                addField: function(selector) {
                    var element = this.createField(selector);

                    this.elements.push(element);
                    Util.debug('Element created', options);

                    return element;
                },

                addSingleGroupedField: function(key, selectors, single) {
                    this.elementGroups[key] = this.createFieldGroup(selectors, single);
                },

                addGroupedFields: function($el) {
                    $.each(Util.getCheckboxes($el || this.$el), function(key, value) {
                        if (value.length > 1) {
                            that.addSingleGroupedField.call(this, key, value, false);
                        } else {
                            // backwards compatibility: single checkbox are handled as boolean values
                            that.addField.call(this, value);
                        }
                    }.bind(this));

                    $.each(Util.getRadios($el || this.$el), function(key, value) {
                        that.addSingleGroupedField.call(this, key, value, true);
                    }.bind(this));
                }
            },

            result = {
                elements: [],
                elementGroups: {},
                options: {},
                validation: false,
                mapper: false,

                createField: function(selector) {
                    var element = that.createField(selector);

                    element.initialized.then(function() {
                        element.fieldAdded(element);
                    }.bind(this));

                    return element;
                },

                createFieldGroup: function(selectors, single) {
                    return that.createFieldGroup(selectors, single);
                },

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

                addGroupedFields: function($el) {
                    return that.addGroupedFields.call(this, $el);
                },

                initFields: function($el) {
                    return that.initFields.call(this, $el);
                },

                removeFields: function($el) {
                    Util.getFields($el).each(function(i, item) {
                        this.removeField(item);
                    }.bind(this));
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
