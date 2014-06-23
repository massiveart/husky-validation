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
    'validator/default'
], function(Default) {

    'use strict';

    return function($el, form, element, options) {
        var defaults = {
                equal: null
            },

        // elements with same group name
            relatedElements = [],

        // is the element related
            isElementRelated = function(element, group) {
                return relatedElements.indexOf(element) && !!element.options.validationEqual && element.options.validationEqual === group;
            },

        // validate all related element
            validateElements = function(val) {
                var result = true;
                $.each(relatedElements, function(key, element) {
                    if (!validateElement(val, element)) {
                        result = false;
                        return false;
                    }
                    return true;
                });
                return result;
            },

        // validate one element
            validateElement = function(val, element) {
                return val === element.getValue();
            },

        // update all related elements
            updateRelatedElements = function() {
                $.each(relatedElements, function(key, element) {
                    element.update();
                });
            },

            result = $.extend(new Default($el, form, defaults, options, 'equal'), {

                initializeSub: function() {
                    // init related elements
                    element.initialized.then(function() {
                        $.each(form.elements, function(key, element) {
                            this.fieldAdded(element);
                        }.bind(this));
                    }.bind(this));
                },

                validate: function() {
                    var val = this.$el.val(),
                        result;
                    if (!!this.data.equal) {
                        result = validateElements(val);
                        updateRelatedElements();
                        return result;
                    } else {
                        throw 'No option group set';
                    }
                },

                update: function() {
                    var val = this.data.element.getValue(),
                        result;
                    if (!!this.data.equal) {
                        result = validateElements(val);
                        return result;
                    } else {
                        throw 'No option group set';
                    }
                },

                fieldAdded: function(element) {
                    if (element.$el !== this.$el && isElementRelated(element, this.data.equal)) {
                        relatedElements.push(element);
                    }
                },

                fieldRemoved: function(element) {
                    relatedElements = relatedElements.splice(relatedElements.indexOf(element), 1);
                }
            });

        result.initialize();
        return result;
    };

});
