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
    'jquery',
    'js/validators/default'
], function($, Default) {

    return function($el, options) {
        var defaults = {
            maxlength: 999
        };

        var result = $.extend({}, new Default($el, defaults, options, 'maxlength'), {
            validate: function() {
                var val = this.$el.val();
                return val.length <= this.data.maxlength;
            }
        });

        result.initialize();
        return result;
    };

});
