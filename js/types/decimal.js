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
            regExp: /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/
        };

        var typeInterface = {
            initializeSub:function(){
                // TODO internationalization
            },

            validate: function() {
                return this.options.regExp.test(this.$el.val());
            }
        };

        return new Default($el, defaults, options, 'decimal', typeInterface);
    };
});
