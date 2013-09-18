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

        var result = $.extend({}, new Default($el, defaults, options, 'string'), {
            initializeSub:function(){
                // TODO internationalization
            },

            validate: function() {
                return true
            }
        });


        result.initialize();
        return result;
    };
});
