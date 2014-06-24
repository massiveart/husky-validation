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
                returnValue: null,
                hiddenData: null
            },

            typeInterface = {
                setValue: function(value) {

                    this.options.hiddenData = value;

                    if (typeof value === 'object') {
                        this.$el.data('id', value[this.options.id]);
                    }
                },

                getValue: function() {
                    if (this.options.hiddenData !== null) {
                        return this.options.hiddenData;
                    } else {
                        return this.options.returnValue;
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
