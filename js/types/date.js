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
    'type/default',
    'form/util'
], function(Default, Util) {

    'use strict';

    return function($el, options) {
        var defaults = {
                format: 'd'     // possibilities f, F, t, T, d, D
            },

            getDate = function(value) {
                Util.debug(value, new Date(value));
                return new Date(value);
            },

            subType = {
                validate: function() {
                    var val = Util.getValue(this.$el), date;
                    if (val === '') {
                        return true;
                    }

                    date = Globalize.parseDate(val, this.options.format);
                    return date !== null;
                },

                needsValidation: function() {
                    var val = Util.getValue(this.$el);
                    return val !== '';
                },

                // internationalization of view data: Globalize library
                getViewData: function(value) {
                    return Globalize.format(getDate(value), this.options.format);
                },

                // internationalization of model data: Globalize library
                getModelData: function(value) {
                    if (value !== '') {
                        var date = Globalize.parseDate(value, this.options.format);
                        return date.toISOString();
                    } else {
                        return value;
                    }
                }
            };

        return new Default($el, defaults, options, 'date', subType);
    };
});
