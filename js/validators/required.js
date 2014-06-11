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
        var defaults = { },

            result = $.extend(new Default($el, form, defaults, options, 'required'), {
                validate: function(value, recursion) {
                    if (recursion && !value) {
                        return false;
                    }
                    if (!!this.data.required) {
                        var val = value || Util.getValue(this.$el), i;
                        // for checkboxes and select multiples.
                        // check there is at least one required value
                        if ('object' === typeof val) {
                            for (i in val) {
                                if (val.hasOwnProperty(i)) {
                                    if (this.validate(val[i]), true) {
                                        return true;
                                    }
                                }
                            }
                            return false;
                        }

                        // notNull && notBlank && not undefined
                        return typeof val !== 'undefined' && val.length > 0 && '' !== val.replace(/^\s+/g, '').replace(/\s+$/g, '');
                    }
                    return true;
                }
            });

        result.initialize();
        return result;
    };

});
