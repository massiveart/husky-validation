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
                defaultValue: null
            },

            typeInterface = {

                hiddenData: null,

                setValue: function(value) {
                    this.hiddenData = value;
                    if (!!value && typeof value === 'object' && !!value[this.options.id]) {
                        this.$el.data('id', value[this.options.id]);
                    }
                },

                getValue: function() {
                    if (this.hiddenData !== null) {
                        return this.hiddenData;
                    } else {
                        return this.options.defaultValue;
                    }
                },

                needsValidation: function() {
                    return false;
                },

                validate: function() {
                    return true;
                }
            };

        return new Default($el, defaults, options, 'hiddenData', typeInterface);
    };
});
