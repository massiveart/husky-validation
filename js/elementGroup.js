/*
 * This file is part of Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

define(function() {
    'use strict';

    var setMultipleValue = function(elements, values) {
            elements.forEach(function(element) {
                values.forEach(function(value) {
                    if (element.$el.val() === value) {
                        element.$el.prop('checked', true);
                    }
                });
            });
        },

        setSingleValue = function(elements, value) {
            for (var i = -1; ++i < elements.length;) {
                if (elements[i].$el.val() === value) {
                    elements[i].$el.prop('checked', true);

                    return;
                }
            }
        };

    return function(elements, isSingleValue) {
        var result = {
            getValue: function() {
                var value = [];
                elements.forEach(function(element) {
                    if (element.$el.is(':checked')) {
                        value.push(element.$el.val());
                    }
                });

                if (!!isSingleValue) {
                    if (value.length > 1) {
                        throw new Error('Single value element group cannot return more than one value');
                    }

                    return value[0];
                }

                return value;
            },

            setValue: function(values) {
                if (!!isSingleValue && !!$.isArray(values)) {
                    throw new Error('Single value element cannot be set to an array value');
                }

                if (!isSingleValue && !$.isArray(values)) {
                    throw new Error('Field with multiple values cannot be set to a single value');
                }

                if ($.isArray(values)) {
                    setMultipleValue.call(this, elements, values);
                } else {
                    setSingleValue.call(this, elements, values);
                }
            }
        };

        elements.forEach(function(element) {
            element.$el.data('elementGroup', result);
        });

        return result;
    };
});
