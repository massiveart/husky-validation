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
                regExp: /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/
            },

            typeInterface = {
                initializeSub: function() {
                },

                validate: function() {
                    var val = this.getValue();

                    if (val === '') {
                        return true;
                    }

                    return this.options.regExp.test(val);
                }
            };

        return new Default($el, defaults, options, 'decimal', typeInterface);
    };
});
