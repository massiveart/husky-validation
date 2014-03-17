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
                    this.$el.data('id', value);
                    if (data.length > 0) {
                        for (i = -1, len = data.length; ++i < len;) {
                            if (data[i].hasOwnProperty(idProperty) && data[i][idProperty] === value) {
                                this.$el.html(data[i][this.options.outputProperty]);
                            }
                        }
                    }
                },

                getValue: function() {
                    var result = {};
                    result[this.options.idProperty] = this.$el.data('id');
                    result[this.options.outputProperty] = this.$el.text();
                    return result;
                },

                needsValidation: function() {
                    return false;
                },

                validate: function() {
                    return true;
                }
            };

        return new Default($el, defaults, options, 'static-text', typeInterface);
    };
});
