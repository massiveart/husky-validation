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

    return function($el, form, options) {
        var defaults = {
                group: null
            },

            result = $.extend(new Default($el, form, defaults, options, 'equal'), {
                validate: function() {
                    var val = this.$el.val();
                    if (!!this.options.group) {
                        // TODO validation
                        return true;
                    } else {
                        throw 'No option group set';
                    }
                }
            });

        result.initialize();
        return result;
    };

});
