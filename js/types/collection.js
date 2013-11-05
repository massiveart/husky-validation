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
], function(Default) {

    'use strict';

    return function($el, options) {
        var defaults = {
                min: 1,
                max: 2
            },

            subType = {
                validate: function() {
                    return true;
                },

                needsValidation: function() {
                    return false;
                },

                canAdd: function() {
                    var length = this.$el.children().length;
                    return length < this.options.max;
                },

                canRemove: function() {
                    var length = this.$el.children().length;
                    return length > this.options.min;
                }
            };

        return new Default($el, defaults, options, 'array', subType);
    };
});
