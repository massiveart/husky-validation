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
        var defaults = {};

        var result = {

            initialize: function() {
                this.$el = $el;
                this.data = $.extend({}, defaults, this.$el.data());
            },

            validate: function() {
                var val = this.$el.val();
                // for checkboxes and select multiples. Check there is at least one required value
                if ('object' === typeof val) {
                    for (var i in val) {
                        if (this.validate(val[i])) {
                            return true;
                        }
                    }
                    return false;
                }
                // parsleyJS notNull && notBlank
                return val.length > 0 && '' !== val.replace(/^\s+/g, '').replace(/\s+$/g, '');
            }
        };

        result.initialize();
        return result;
    };

});
