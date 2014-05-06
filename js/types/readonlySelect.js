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
    'type/default'
], function(Default) {

    'use strict';

    return function($el, options) {
        var defaults = {
                id: null,
                data: [],
                idProperty: 'id',
                outputProperty: 'name'
            },

            typeInterface = {
                setValue: function(value) {
                    var data = this.options.data,
                        idProperty = this.options.idProperty,
                        i , len;

                    // check if value is an object
                    if (typeof value === 'object') {
                        if (value.hasOwnProperty(idProperty)) {
                            value = value[idProperty];
                        } else {
                            throw "value has no property named " + idProperty;
                        }
                    // if value is null continue
                    } else if (value === null) {
                        return;
                    }

                    // set data id to value
                    this.$el.data('id', value);

                    // find value in data
                    if (data.length > 0) {
                        for (i = -1, len = data.length; ++i < len;) {
                            if (data[i].hasOwnProperty(idProperty) && data[i][idProperty].toString() === value.toString()) {
                                this.$el.html(data[i][this.options.outputProperty]);
                                break;
                            }
                        }
                    }
                },

                getValue: function() {
                    var id = this.$el.data('id'),
                        i, len;

                    for (i = -1, len = this.options.data.length; ++i < len;) {
                        if (this.options.data[i][this.options.idProperty].toString() === id.toString()) {
                            return this.options.data[i];
                        }
                    }
                    return null;
                },

                needsValidation: function() {
                    return false;
                },

                validate: function() {
                    return true;
                }
            };

        return new Default($el, defaults, options, 'readonly-select', typeInterface);
    };
});
