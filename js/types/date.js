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

    return function($el, options) {
        var defaults = {
            regExp: /^(\d{4})\D?(0[1-9]|1[0-2])\D?([12]\d|0[1-9]|3[01])$/
        };

        var result = {
            initialize: function() {
                this.options = $.extend({}, defaults, options);
                this.$el = $el;
            },

            validate: function() {
                return this.options.regExp.test(this.$el.val());
            }
        };

        result.initialize();
        return result;
    };
});
