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
    'js/validators/default'
], function(Default) {

    return function($el) {
        var defaults = {
            min: 0
        };

        var result = $.extend({}, new Default($el, defaults, 'min'), {
            validate: function() {
                var val = this.$el.val();
                return Number(val) >= this.data.min;
            }
        });

        result.initialize();
        return result;
    };

});