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
        };

        var typeInterface = {
            initializeSub: function() {
                // TODO internationalization
            },

            needsValidation: function() {
                return false;
            },

            validate: function() {
                return true;
            }
        };

        return new Default($el, defaults, options, 'string', typeInterface);
    };
});
