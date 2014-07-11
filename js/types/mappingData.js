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
                defaultValue: null,
                mapping: null,
                searchProperty: 'id',
                showProperty: 'name'
            },

            typeInterface = {

                setValue: function(value) {
                    if (value !== null && typeof value !== 'object') {
                        this.$el.data('value', value);
                        this.$el.text(this.getMappingValue(value) || this.options.defaultValue);
                    }
                },

                getValue: function() {

                    var value = this.$el.data('value');

                    if (value !== null) {
                        return value;
                    } else {
                        return this.options.defaultValue;
                    }
                },

                needsValidation: function() {
                    return false;
                },

                validate: function() {
                    return true;
                },

                getMappingValue: function(val) {

                    var key, obj = this.options.mapping;

                    if (!!obj) {
                        for (key in this.options.mapping) {
                            if (!!obj.hasOwnProperty(key)) {
                                if (obj[key].hasOwnProperty(this.options.searchProperty) &&
                                    obj[key].hasOwnProperty(this.options.showProperty) &&
                                    String(obj[key][this.options.searchProperty]) === String(val)) {
                                    return obj[key][this.options.showProperty];
                                }
                            }
                        }
                    }
                }
            };

        return new Default($el, defaults, options, 'hiddenData', typeInterface);
    };
});
