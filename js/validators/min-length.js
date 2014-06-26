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
    'validator/default'
], function(Default) {

    'use strict';

    return function($el, form, element, options) {
        var defaults = {
                minLength: 0
            },

            result = $.extend(new Default($el, form, defaults, options, 'min-length'), {
                validate: function() {
                    var val = this.data.element.getValue();
                    return val.length >= this.data.minLength;
                }
            });

        result.initialize();
        return result;
    };

});
