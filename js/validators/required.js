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
        var defaults = { },

            result = $.extend(new Default($el, form, defaults, options, 'required'), {
                validate: function() {
                    if (!!this.data.required) {
                        var val = this.data.element.getValue();

                        if (typeof val === 'number') {
                            return true;
                        }

                        if (!!_.isString(val)) {
                            val = val.trim();
                        }

                        // notNull && notBlank && not undefined
                        if (!val) {
                            return false;
                        }

                        // not empty array, object and string
                        return _.size(val) > 0;
                    }
                    return true;
                }
            });

        result.initialize();

        return result;
    };

});
