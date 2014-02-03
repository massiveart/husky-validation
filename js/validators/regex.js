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
    'validator/default',
    'form/util'
], function(Default, Util) {

    'use strict';

    return function($el, form, element, options) {
        var defaults = {
                regex: /\w*/
            },

            result = $.extend(new Default($el, form, defaults, options, 'regex'), {
                validate: function() {
                    // TODO flags
                    var pattern = this.data.regex,
                        regex = new RegExp(pattern),
                        val = Util.getValue(this.$el);

                    if (val === '') {
                        return true;
                    }

                    return regex.test(val);
                }
            });

        result.initialize();
        return result;
    };

});
