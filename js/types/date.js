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

    return function($el, options) {
        var defaults = {
            format: "d"     // possibilities f, F, t, T, d, D
        };

        var getDate = function(value) {
                return new Date(value);
            },
            toMysqlFormat = function(date) {
                return date.toISOString();
            };

        var subType = {
            validate: function() {
                var val = this.$el.val();
                if (val == "")return true;

                var date = Globalize.parseDate(val, this.options.format);
                return date != null;
            },

            // internationalization of view data: Globalize library
            getViewData: function(value) {
                return Globalize.format(getDate(value), this.options.format);
            },

            // internationalization of model data: Globalize library
            getModelData: function(value) {
                var val = this.$el.val();
                if (val !== '') {
                    var date = Globalize.parseDate(val, this.options.format);
                    return toMysqlFormat(date);
                } else {
                    return val;
                }
            }
        };

        return new Default($el, defaults, options, 'date', subType);
    };
});
