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
    'js/types/default'
], function(Default) {

    return function($el, options) {
        var defaults = {
            regExp: /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/
        };

        var result = $.extend({}, new Default($el, defaults, options, 'decimal'), {
            initializeSub:function(){
                // TODO internationalization
            },

            validate: function() {
                return this.data.regExp.test(this.$el.val());
            }
        });

        result.initialize();
        return result;
    };
});
