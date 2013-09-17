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

    return function($el, options) {
        var defaults = {};

        var result = $.extend({}, new Default($el, defaults, options, 'required'), {
            validate: function() {
                if (!!this.data.required) {
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
                return true;
            }
        });

        result.initialize();
        return result;
    };

});
