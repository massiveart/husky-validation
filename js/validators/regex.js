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

    'use strict';

    return function($el, form, element, options) {
        var defaults = {
                regex: /\w*/
            },

            result = $.extend(new Default($el, form, defaults, options, 'regex'), {
                validate: function() {
                    var flags = this.data.regex.replace(/.*\/([gimy]*)$/, '$1'),
                        pattern = this.data.regex.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1'),
                        regex = new RegExp(pattern, flags),
                        val = this.$el.val();

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
