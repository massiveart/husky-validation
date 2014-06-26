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
                id: 'id',
                label: 'name',
                type: 'object'
            },

            typeInterface = {
                setValue: function(value) {
                    if (typeof value === 'object') {
                        this.$el.val(value[this.options.id]);
                    } else {
                        // find option where id == value and set it to selected
                        this.$el.find('option[id='+value+']').attr('selected','selected');
                        this.options.type = 'string';
                    }
                },

                getValue: function() {
                    if (this.options.type === 'object') {
                        var result = {};
                        result[this.options.id] = Util.getValue(this.$el);
                        result[this.options.label] = this.$el.find('option:selected').text();
                        return result;
                    } else {
                        // return id of selected element
                        return this.$el.children(':selected').attr('id');
                    }

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
