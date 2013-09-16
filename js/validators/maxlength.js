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
    'jquery'
], function($) {

    return function($el) {
        var defaults = {
            maxlength: 999
        };

        var result = {

            initialize: function() {
                this.$el = $el;
                this.data = $.extend({}, defaults, this.$el.data());
            },

            validate: function() {
                var val = this.$el.val();
                return val.length <= this.data.maxlength;
            }
        };

        result.initialize();
        return result;
    };

});
