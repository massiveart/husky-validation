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
    'form/util'
], function(Util) {

    return function(form) {
        var valid;

        // private functions
        var that = {
            initialize: function() {
                that.bindValidationDomEvents.call(this);

                Util.debug('INIT Validation');
            },

            bindValidationDomEvents: function() {
                if (!!form.options.validationSubmitEvent) {
                    // avoid submit if not valid
                    form.$el.on('submit', function() {
                        return form.validation.validate();
                    }.bind(this));
                }
            },

            setValid: function(state) {
                valid = state;
            }
        };

        // define validation interface
        var result = {
            validate: function(force) {
                var result = true;
                // validate each element
                $.each(form.elements, function(key, element) {
                    if (!element.validate(force)) {
                        result = false;
                    }
                });

                that.setValid.call(this, result);
                Util.debug('Validation', !!result ? 'success' : 'error');
                return result;
            },

            isValid: function() {
                return valid;
            },

            updateConstraint: function(selector, name, options) {
                var $element = $(selector);
                if (!!$element.data('element')) {
                    $(selector).data('element').updateConstraint(name, options);
                } else {
                    throw 'No validation element';
                }
            },

            deleteConstraint: function(selector, name) {
                var $element = $(selector);
                if (!!$element.data('element')) {
                    $element.data('element').deleteConstraint(name);
                } else {
                    throw 'No validation element';
                }
            },

            addConstraint: function(selector, name, options) {
                var $element = $(selector);
                if (!!$element.data('element')) {
                    $element.data('element').addConstraint(name, options);
                } else {
                    // create a new one
                    var element = form.addField(selector);
                    // add constraint
                    element.addConstraint(name, options);
                    form.elements.push(element);
                }
            }
        };

        that.initialize.call(result);
        return result;
    }

});
