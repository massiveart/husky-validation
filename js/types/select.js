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
                id: 'id',
                label: 'name'
            },

            typeInterface = {
                setValue: function(value) {
                    this.$el.val(value[this.options.id]);
                },

                getValue: function() {
                    var result = {};
                    result[this.options.id] = this.$el.val();
                    result[this.options.label] = this.$el.find('option:selected').text();
                    return result;
                },

                needsValidation: function() {
                    return false;
                },

                validate: function() {
                    return true;
                }
            };

        return new Default($el, defaults, options, 'select', typeInterface);
    };
});
