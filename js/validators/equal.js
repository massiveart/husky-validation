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
                group: null
            },

            // elements with same group name
            relatedElements = [],

            // is the element related
            isElementRelated = function(element) {
                return element.getConstraint(this.name).options.group === this.options.group;
            },

            // validate all related element
            validateElements = function(val) {
                var result = true;
                $.each(relatedElements, function(key, element) {
                    if (validateElement(val, element)) {
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

            result = $.extend(new Default($el, form, defaults, options, 'equal'), {

                initializeSub: function() {
                    // init related elements
                    $.each(form.elements, function(key, element) {
                        if (isElementRelated(element)) {
                            relatedElements.push(element);
                        }
                    });
                },

                validate: function() {
                    var val = this.$el.val();
                    if (!!this.options.group) {
                        return validateElements(val);
                    } else {
                        throw 'No option group set';
                    }
                }
            });

        result.initialize();
        return result;
    };

});
